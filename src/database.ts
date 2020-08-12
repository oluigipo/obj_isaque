import { MongoClient, Collection } from "mongodb";

export let db: MongoClient;
export const dbname = "maindb";
export const collections = {
	"mutes": <Collection>{}
};

export async function init(password: string) {
	let success = true;
	const uri = `mongodb+srv://mainbot:${password}@objisaquedb.ogmij.mongodb.net/${dbname}?retryWrites=true&w=majority`;

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

	collections.mutes = mutes;

	return success;
}

export async function done() {
	await db.logout();
}