import { MongoClient, Collection, MongoError } from "mongodb";
import { defaultErrorHandler } from "./defs";

export let db: MongoClient;
export const dbname = "maindb";
export const collections = {
	"mutes": <Collection>{},
	"balance": <Collection>{}
};

type CollectionName = keyof typeof collections;

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

export async function readCollection(name: CollectionName, object: string): Promise<any>;
export async function readCollection(name: CollectionName): Promise<{ [key: string]: any }>;

export async function readCollection(name: CollectionName, object?: string) {
	const db = collections[name];
	const things = (await db.find({}).toArray())[0];

	if (typeof object === "string") {
		return things[object];
	} else {
		return things;
	}
}

export async function writeCollection(name: CollectionName, object: string, value: any) {
	const db = collections[name];

	const $set = <any>{};
	$set[object] = value;

	const projection = <any>{ _id: 0 };
	projection[object] = 1;

	await db.findOneAndUpdate({}, { $set }, { projection }).catch(defaultErrorHandler);
}

export async function done() {
	await db.logout();
}