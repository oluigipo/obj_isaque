const naipeNames = ["espadas", "copas", "paus", "ouro"];
const cardNames = ["Ás", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Valete", "Dama", "Rei"];

export class Deck {
    public size: number = 52;
    public useJokers: boolean = false;
    public inDeck: Array<Card> = [];
    public offDeck: Array<Card> = [];

    constructor(useJokers = false) {
        this.useJokers = useJokers;
        
        for (let naipe in naipeNames) {
            for (let card in cardNames) {
                this.inDeck.push(new Card(card, naipe));
            }
        }

        if (this.useJokers) {
            for (let i = 0; i < 2; i++) {
                this.inDeck.push(new Card("Coringa", "", true));
            }
        }
        
        console.log("Baralho criado");
        this.shuffle();
    }

    listInDeck() {
        console.log('Cartas no Deck:\n');
        this.inDeck.map(item => console.log(item.describe()));
    }

    listOffDeck() {
        console.log("Cartas fora do Deck:\n");
        this.offDeck.map(item => console.log(item.describe()));
    }

    shuffle() {
        this.inDeck.sort(() => Math.random() - 0.5);
        console.log("Deck embaralhado");
    }
}

class Card {
    public value: string;
    public naipe: string;

    private joker: boolean;

    constructor(value: string, naipe: string, joker: boolean = false) {
        this.value = value;
        this.naipe = naipe;
        this.joker = joker;
    }

    describe() {
        const { value, naipe, joker } = this;

        if (joker)
            return value;
        
        return `${value} de ${naipe}`;
    }
} 