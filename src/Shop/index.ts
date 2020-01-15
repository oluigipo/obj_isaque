import { User, Company, upgrades, emojis } from "./defs";
import fs from "fs";
import { Server, Emojis, Time } from "../definitions";

interface UsersJSON {
	users: User[];
	companies: Company[];
	lastUpdate: number;
}

const json: UsersJSON = JSON.parse(fs.readFileSync("./data/usersshop.json", "utf8"));
const fail = (reason: string): ActionResponse => { return { success: false, reason: `${Emojis.no} **|** ${reason}` }; };
const success = (extra?: any): ActionResponse => { return { success: true, extra: extra }; };

export function save() {
	fs.writeFileSync("./data/usersshop.json", JSON.stringify(json), "utf8");
}

export function start() {
	const now = Date.now();
	const times = Math.floor((now - json.lastUpdate) / Time.hour);

	for (let i = 0; i < times; i++) update();
	json.lastUpdate = Date.now();

	save();
	setTimeout(loop, Time.hour);
}

export function update() {
	json.users.forEach((u) => {
		u.money += moneyPerHour(u.upgrades);
	});
}

function loop() {
	update();
	json.lastUpdate = Date.now();
	console.log("Atualizou!", Date.now());
	save();
	setTimeout(update, Time.hour);
}

export function moneyPerHour(upgs: number[]): number {
	return upgrades.reduce((p, c, i) => p + c.boost * upgs[i], 100);
}

export function getUser(userid: string): User | undefined {
	const u = json.users.find((user) => user.id === userid);
	return u;
}

export function companyMembers(comp: Company): User[] {
	let result = <User[]>[];

	comp.members.forEach(s => {
		const u = getUser(s);
		if (u === void 0) throw "WTFFF 3 ????";
		result.push(u);
	});

	return result;
}

export enum CLS { MONEY, INCOMES };
export function getTop(t: CLS): User[] {
	let a = [...json.users];
	if (t === CLS.MONEY) {
		a = a.sort((u1, u2) => u2.money - u1.money);
	} else {
		a = a.sort((u1, u2) => moneyPerHour(u2.upgrades) - moneyPerHour(u1.upgrades));
	}

	return a.slice(0, Math.min(a.length, 10));
}

export function updateUser(user: User): void {
	const i = json.users.findIndex((u) => u.id === user.id);

	if (i === -1)
		json.users.push(user);
	else
		json.users[i] = user;

	save();
}

export function updateCompany(comp: Company): void {
	const i = json.companies.findIndex((u) => u.name === comp.name);

	if (i === -1)
		json.companies.push(comp);
	else
		json.companies[i] = comp;

	save();
}

export function getCompany(name: string | User): Company | undefined {
	let c;
	if (typeof name === "string")
		c = json.companies.find((comp) => comp.name === name);
	else
		c = json.companies.find((comp) => comp.members.includes(name.id))
	return c;
}

export function upgradePrice(upindex: number, level: number): number {
	if (level <= 1) return upgrades[upindex].cost;
	return Math.round(upgradePrice(upindex, level - 1) * upgrades[upindex].costMult);
}

export function userBuyUpgrade(userid: string, upindex: number): ActionResponse {
	const user = getUser(userid);
	if (user === void 0) return fail("Você não tem uma lojinha!");
	if (user.upgrades[upindex] >= upgrades[upindex].max) return fail("Este upgrade já está no nível máximo!");

	const price = upgradePrice(upindex, user.upgrades[upindex] + 1);

	if (user.money < price) return fail("Você não tem dinheiro o suficiente!");
	user.money -= price;
	user.upgrades[upindex]++;

	updateUser(user);

	return success();
}

export function userWork(userid: string): ActionResponse {
	const user = getUser(userid);
	if (user === void 0) return fail("Você não tem uma lojinha!");

	const now = Date.now();
	if (user.lastWork + Time.minute * 5 > now) return fail("Descanse um pouco!");

	const g = 100 * ((getCompany(user)?.level ?? 0) + 1);
	user.money += g;
	user.lastWork = now;
	updateUser(user);
	return success(g);
}

export function userDaily(userid: string): ActionResponse {
	const user = getUser(userid);
	if (user === void 0) return fail("Você não tem uma lojinha!");

	const now = Date.now();
	if (user.lastDaily + Time.day > now) return fail("Você ainda não pode resgatar o prêmio diário!");

	const g = 5000 * ((getCompany(user)?.level ?? 0) + 1);
	user.money += g;
	user.lastDaily = now;
	updateUser(user);
	return success(g);
}

export function userRename(userid: string, name: string): ActionResponse {
	const user = getUser(userid);
	if (user === void 0) return fail("Você não tem uma lojinha!");

	user.name = name;
	updateUser(user);
	return success(name);
}

export function companyCreate(userid: string, name: string): ActionResponse {
	const user = getUser(userid);
	if (user === void 0) return fail("Você não tem uma lojinha!");
	if (getCompany(name) !== void 0) return fail("Já existe uma empresa com esse nome!");
	if (getCompany(user) !== void 0) return fail("Você já está em uma empresa!");
	if (user.money < 50000) return fail("Você não tem dinheiro o suficiente para fundar uma empresa!");

	const company: Company = {
		level: 1,
		members: [user.id],
		name: name,
		money: 0
	}

	updateCompany(company);
	return success(name);
}

export function companyApply(userid: string, qnt: number): ActionResponse {
	const user = getUser(userid);
	if (user === void 0) return fail("Você não tem uma lojinha!");

	const company = getCompany(user);
	if (company === void 0) return fail("Você não está em uma empresa!");
	if (user.money < qnt) return fail("Você não tem dinheiro o suficiente para doar essa quantidade!");

	company.money += qnt;
	user.money -= qnt;
	updateCompany(company);
	updateUser(user);
	return success(qnt);
}

export function companyUpgradePrice(level: number): number {
	return 1000 * (10 ** level);
}

export function companyJoin(userid: string): ActionResponse {
	const user = getUser(userid);
	if (user === void 0) return fail("Você não tem uma lojinha!");
	if (user.invite === -1) return fail("Você não foi convidado para nenhuma empresa, você pode começar a sua!");

	const company = json.companies[user.invite];
	if (company === void 0) {
		user.invite = -1;
		updateUser(user);
		return fail("Convite inválido!");
	}

	company.members.push(user.id);
	user.invite = -1;
	updateCompany(company);
	updateUser(user);
	return success(company.name);
}

export function companyProducts(comp: Company): string {
	let products = "";

	comp.members.forEach(id => {
		const user = getUser(id);
		if (user === void 0) throw `MASUQ????`;

		products += emojis.slice(user.emoji, (user.emoji + 2));
	});

	return products;
}

export function companyInvite(comp: Company, userid: string): ActionResponse {
	let user = getUser(userid);
	if (user === void 0) return fail("Este usuário não tem uma lojinha!");
	if (getCompany(user) !== void 0) return fail("Este usuário já está em uma empresa!");
	if (user.invite !== -1) return fail("Este usuário já tem um convite pendente!");

	user.invite = json.companies.findIndex(c => c.name === comp.name);
	if (user.invite === -1) throw `MASUQ 2????`;
	updateUser(user);
	return success(user.name);
}

export function companyIncomes(comp: Company): number {
	let incomes = 0;

	comp.members.forEach(id => {
		const user = getUser(id);
		if (user === void 0) throw `MASUQ????`;

		incomes += moneyPerHour(user.upgrades);
	});

	return incomes;
}

export function companyDeny(userid: string): ActionResponse {
	const user = getUser(userid);
	if (user === void 0) return fail("Você não tem uma lojinha!");
	if (user.invite === -1) return fail("Você não foi convidado para nenhuma empresa!");

	const company = json.companies[user.invite];
	if (company === void 0) {
		user.invite = -1;
		updateUser(user);
		return fail("Convite inválido!");
	}

	user.invite = -1;
	return success(company.name);
}

export function companyLeave(userid: string): ActionResponse {
	const user = getUser(userid);
	if (user === void 0) return fail("Você não tem uma lojinha!");

	const company = getCompany(user);
	if (company === void 0) return fail("Você não está em uma empresa!");
	if (company.members[0] === user.id) return fail("Você não pode sair de uma empresa que você tem posse!");

	company.members = company.members.filter(m => m !== user.id);
	updateCompany(company);
	return success(company.name);
}

export function companyLevelUp(userid: string): ActionResponse {
	const user = getUser(userid);
	if (user === void 0) return fail("Você não tem uma lojinha!");

	const company = getCompany(user);
	if (company === void 0) return fail("Você não está em uma empresa!");
	if (company.members[0] !== user.id) return fail("Você não pode dar Level Up numa empresa que você não tem posse!");
	if (company.level > 5) return fail("Sua empresa já está no nível máximo!");
	const cost = companyUpgradePrice(company.level);
	if (company.money < cost) return fail("Sua empresa não tem dinheiro o suficiente para subir de nível!");

	company.money -= cost;
	company.level++;
	updateCompany(company);
	return success(company.level);
}

export function companyDelete(userid: string): ActionResponse {
	const user = getUser(userid);
	if (user === void 0) return fail("Você não tem uma lojinha!");

	const company = getCompany(user);
	if (company === void 0) return fail("Você não está em uma empresa!");
	if (company.members[0] !== user.id) return fail("Você não pode deletar de uma empresa que você não tem posse!");

	json.companies = json.companies.filter(c => c.name !== company.name);
	save();
	return success(company.name);
}

export function companyRename(userid: string, name: string): ActionResponse {
	const user = getUser(userid);
	if (user === void 0) return fail("Você não tem uma lojinha!");

	const comp = getCompany(user);
	if (comp === void 0) return fail("Você não está em uma empresa!");
	if (user.id !== comp.members[0]) return fail("Você não é o dono dessa empresa!");

	comp.name = name;
	updateCompany(comp);
	return success(name);
}

export function userCreate(userid: string, emoji: string, name: string): ActionResponse {
	let user = getUser(userid);
	if (user !== void 0) return fail("Você já tem uma lojinha!");

	user = {
		id: userid,
		money: 0,
		upgrades: Array<number>(upgrades.length).fill(0),
		emoji: emojis.indexOf(emoji),
		name: name,
		slogan: `Dica: use \`${Server.prefix}shop slogan\` para escolher um slogan!\nAliás, markdown é permitido!`,
		lastWork: 0,
		lastDaily: 0,
		invite: -1
	};

	updateUser(user);
	return success();
}

export type ActionResponse = __succ | __fail;
interface __succ {
	success: true;
	extra?: any;
}
interface __fail {
	success: false;
	reason: string;
}

export * from "./defs";