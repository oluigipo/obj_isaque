/**
 * !!shop help
 * !!shop create emoji name
 * !!shop apply
 * !!
 */

/**
 * Emojis permitidos.
 */
export const emojis = "🍏🍎🍐🍊🍋🍌🍉🍇🍓🍈🍒🍑🥭🍍🥥🥝🍅🍆🥑🥦🥐🍠🥔🧄🧅🥕🌽🌶️🥒🥬🥯🍞🥖🥨🧀🥚🍳🥞🧇🥓🥙🧆🥪🍕🍟🍔🌭🍖🍗🥩🌮🌯🥗🥘🥫🍝🍜🍲🍛🍣🍢🥮🥠🍥🍘🍚🍙🍤🥟🍱🍡🍧🍨🍦🥧🧁🍰🎂🍮🍭🥛🧈🍯🥜🌰🍪🍩🍿🍫🍬🍼☕🍵🧉🥤🧃🧊🍶🍺🍻🥣🍽️🍴🥄🍾🍹🍸🥃🍷🥂🥡🥢🧂";

export interface Upgrade {
	name: string;
	boost: number;
	max: number;
	cost: number;
	costMult: number;
}

export const upgrades: Upgrade[] = [
	{ name: "Decoração", boost: 50, max: 20, cost: 250, costMult: 1.2 },
	{ name: "Marketing", boost: 250, max: 10, cost: 1000, costMult: 2 },
	{ name: "Empregados", boost: 100, max: 12, cost: 1000, costMult: 1.5 },
	{ name: "Estacionamento", boost: 50, max: 10, cost: 500, costMult: 1.5 },
	{ name: "Tamanho", boost: 1000, max: 5, cost: 2000, costMult: 5 },
];

/**
 * A interface que representa um usuário.
 */
export interface User {
	id: string;
	money: number;
	upgrades: number[];
	emoji: number;
	name: string;
	slogan: string;
	lastWork: number;
	lastDaily: number;
	invite: number;
}

/**
 * A interface que representa uma empresa.
 */
export interface Company {
	members: string[];
	level: number;
	name: string;
	money: number;
}