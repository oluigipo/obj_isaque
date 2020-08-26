import { MongoClient, Collection } from "mongodb";

export let db: MongoClient;
export const dbname = "maindb";
export const collections = {
	"mutes": <Collection>{},
	"balance": <Collection>{}
};

export async function init(uriTemplate: string, password: string) {
	let success = true;
	const uri = uriTemplate.replace("{password}", password).replace("{dbname}", dbname);

	db = new MongoClient(uri, { useUnifiedTopology: true });
	await db.connect().catch(err => {
		console.log(err);
		success = false;
	});

	const dbo = db.db();

	let mutes = dbo.collection("mutes", {}, (err, c) => {
		if (err) {
			console.log(err);
			success = false;
		}
	});

	let balance = dbo.collection("balance", {}, err => {
		if (err) {
			console.log(err);
			success = false;
		}
	});

	collections.mutes = mutes;
	collections.balance = balance;

	return success;
}

export async function done() {
	await db.logout();
}