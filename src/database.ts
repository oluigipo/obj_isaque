import { MongoClient, Collection, MongoError } from "mongodb";

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

	const errorHandler = (err: MongoError) => {
		if (err) {
			console.log(err);
			success = false;
		}
	};

	collections.mutes = dbo.collection("mutes", {}, errorHandler);
	collections.balance = dbo.collection("balance", {}, errorHandler);

	return success;
}

export async function done() {
	await db.logout();
}