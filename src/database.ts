import { MongoClient, Collection, MongoError } from "mongodb";
import * as Common from "./common";

// NOTE(ljre): Types and globals
export let db: MongoClient;
export const dbname = "maindb";
export const collections = {
	"mutes": <Collection>{},
	"balance": <Collection>{}
};

type CollectionName = keyof typeof collections;

// NOTE(ljre): Events
export async function init(): Promise<boolean> {
	let success = true;
	const uriTemplate = Common.auth.mongoURI;
	const password = Common.auth.mongo;

	const uri = uriTemplate.replace("{password}", password).replace("{dbname}", dbname);

	db = new MongoClient(uri, { /*useUnifiedTopology: true*/ });
	await db.connect().catch(err => {
		Common.error(err);
		success = false;
	});

	const dbo = db.db();

	collections.mutes = dbo.collection("mutes", {});
	collections.balance = dbo.collection("balance", {});

	return success;
}

export async function done() {
	await db.close();
}

// NOTE(ljre): API
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

	await db.findOneAndUpdate({}, { $set }, { projection }).catch(Common.error);
}
