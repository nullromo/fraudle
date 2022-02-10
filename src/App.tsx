import React from 'react';
import moment from 'moment';

const YELLOW = '🟨';
const GREEN = '🟩';
const GRAY = '⬜';

const assertUnreachable = (_: never): never => {
    throw new Error('This error is impossible.');
};

type Letter = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
/*
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
    | 18
    | 19
    | 20
    | 21
    | 22
    | 23
    | 24
    | 25
    | 26*/

const randomLetter = () => {
    const LETTERS: Letter[] = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10 /*11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26,*/,
    ];
    return LETTERS[Math.floor(Math.random() * LETTERS.length)];
};

type Word = [Letter, Letter, Letter, Letter, Letter];

enum LetterResult {
    LOCKED_IN,
    RIGHT,
    WRONG,
}

type WordResult = [
    LetterResult,
    LetterResult,
    LetterResult,
    LetterResult,
    LetterResult,
];

const generateRandomWord = () => {
    return [...Array(5)].map((_) => {
        return randomLetter();
    }) as Word;
};

class WordleGame {
    private answer: Word;

    private guesses: Word[] = [];

    private results: WordResult[] = [];

    public constructor(private readonly hardMode: boolean) {
        this.answer = generateRandomWord();
    }

    private readonly analyzeGuess = (guess: Word) => {
        let answerCopy: Array<Letter | null> = [...this.answer];
        return guess.map((letter, position) => {
            if (letter === answerCopy[position]) {
                answerCopy[position] = null;
                return LetterResult.LOCKED_IN;
            }
            const index = answerCopy.findIndex((answerLetter) => {
                return answerLetter === letter;
            });
            if (index !== -1) {
                answerCopy[index] = null;
                return LetterResult.RIGHT;
            }
            return LetterResult.WRONG;
        }) as WordResult;
    };

    private readonly addGuess = (guess: Word) => {
        this.guesses.push(guess);
        this.results.push(this.analyzeGuess(guess));
    };

    private readonly guess = () => {
        if (this.guesses.length === 0) {
            this.addGuess(generateRandomWord());
            return;
        }
        const previousGuess = this.guesses[this.guesses.length - 1];
        const previousResult = this.results[this.results.length - 1];
        if (this.hardMode) {
            const checkHardMode = (nextGuess: Word) => {
                const nextResult = this.analyzeGuess(nextGuess);
                return previousResult.every((letterResult, position) => {
                    const previousLetter = previousGuess[position];
                    switch (letterResult) {
                        case LetterResult.LOCKED_IN:
                            return (
                                nextResult[position] === LetterResult.LOCKED_IN
                            );
                        case LetterResult.RIGHT:
                            return nextGuess.some((nextLetter) => {
                                return nextLetter === previousLetter;
                            });
                        case LetterResult.WRONG:
                            return true;
                        default:
                            return assertUnreachable(letterResult);
                    }
                });
            };
            let nextGuess: Word;
            let tries = 0;
            do {
                tries += 1;
                nextGuess = generateRandomWord();
            } while (tries < 1_000_000 && !checkHardMode(nextGuess));
            if (tries > 1_000_000) {
                throw new Error('Took too many tries');
            }
            this.addGuess(nextGuess);
            return;
        }
        this.addGuess(generateRandomWord());
    };

    private readonly win = () => {
        this.addGuess(this.answer);
    };

    private readonly isGameValid = () => {
        return !this.results.slice(0, -1).some((result) => {
            return result.every((letterResult) => {
                return letterResult === LetterResult.LOCKED_IN;
            });
        });
    };

    private readonly reset = () => {
        this.guesses = [];
        this.results = [];
    };

    public readonly play = (selectedLevel: number) => {
        do {
            this.reset();
            [...Array(selectedLevel - 1).keys()].forEach((_) => {
                this.guess();
            });
            this.win();
        } while (!this.isGameValid());
    };

    public readonly toString = () => {
        return this.guesses.map((guess) => {
            return this.analyzeGuess(guess).map((letterResult) => {
                switch (letterResult) {
                    case LetterResult.LOCKED_IN:
                        return GREEN;
                    case LetterResult.RIGHT:
                        return YELLOW;
                    case LetterResult.WRONG:
                        return GRAY;
                    default:
                        return assertUnreachable(letterResult);
                }
            });
        });
    };
}

const EXPLANATION = (
    <div className='explanation'>
        Are your friends all playing Wordle and sending you their emoji squares
        all the time?
        <br />
        <br />
        Do you wish you could participate, but you can't be bothered to actually
        play Wordle?
        <br />
        <br />
        Now your troubles are over.
        <br />
        <br />
        Simply choose your desired skill level and Fraudle will generate an
        emoji square that you can copy and paste anywhere you like to share your
        "accomplishment" with the world.
    </div>
);

type EmptyProps = Record<string, unknown>;
//type EmptyState = Record<string, never>;

interface AppState {
    copied: boolean | null;
    hardMode: boolean;
    output: string;
    selectedLevel: number;
}

export class App extends React.Component<EmptyProps, AppState> {
    public constructor(props: EmptyProps) {
        super(props);
        this.state = {
            copied: null,
            hardMode: false,
            output: '',
            selectedLevel: 3,
        };
    }

    private readonly generate = () => {
        const game = new WordleGame(this.state.hardMode);
        game.play(this.state.selectedLevel);
        const grid = game.toString();
        const gridText = grid
            .map((line) => {
                return line.join('');
            })
            .join('\n');
        const output = `Wordle ${moment().diff(
            moment('20210619', 'YYYYMMDD'),
            'days',
        )} ${this.state.selectedLevel}/6${
            this.state.hardMode ? '*' : ''
        }\n\n${gridText}`;
        this.setState({ output });
    };

    public readonly render = () => {
        const mainContent = (
            <div>
                <h1>Fraudle</h1>
                <div>{EXPLANATION}</div>
                <br />
                <br />
                Skill level:{' '}
                <select
                    onChange={(event) => {
                        this.setState({
                            copied: null,
                            selectedLevel: Number(event.target.value),
                            output: '',
                        });
                    }}
                    value={this.state.selectedLevel}
                >
                    <option value={2}>I'm really lucky</option>
                    <option value={3}>I'm good at Wordle</option>
                    <option value={4}>I know how to play Wordle</option>
                    <option value={5}>I screwed up on the Wordle</option>
                    <option value={6}>I'm bad at Wordle</option>
                </select>
                <br />
                <label>
                    <input
                        type='checkbox'
                        onChange={(event) => {
                            this.setState({
                                copied: null,
                                hardMode: event.target.checked,
                                output: '',
                            });
                        }}
                        checked={this.state.hardMode}
                    />
                    My friends think "hard mode" counts for something
                </label>
                <br />
                <br />
                <button
                    type='button'
                    onClick={() => {
                        this.generate();
                        this.setState({ copied: null });
                    }}
                >
                    Play
                </button>
                <br />
                <br />
                <textarea
                    hidden={!this.state.output}
                    value={this.state.output}
                    cols={16}
                    rows={3 + this.state.selectedLevel}
                    onChange={() => {
                        // do nothing
                    }}
                ></textarea>
                <br />
                <div className='copy-button-container'>
                    <button
                        hidden={!this.state.output}
                        type='button'
                        onClick={async () => {
                            if (window.isSecureContext) {
                                await navigator.clipboard
                                    .writeText(this.state.output)
                                    .then(() => {
                                        this.setState({ copied: true });
                                    })
                                    .catch((error) => {
                                        this.setState({ copied: false });
                                        console.error(
                                            'Cannot copy to clipboard.',
                                        );
                                        console.log(error);
                                    });
                            } else {
                                console.error('Cannot copy to clipboard.');
                                this.setState({ copied: false });
                            }
                        }}
                    >
                        Copy To Clipboard
                    </button>
                    <div hidden={this.state.copied === null}>
                        {this.state.copied ? '✔️' : '❌'}
                    </div>
                </div>
                <div hidden={!this.state.output}>
                    Nice work. Now tell all your friends.
                </div>
            </div>
        );

        return (
            <>
                <div className='main'>{mainContent}</div>
                <div className='footer'>
                    © 2022 Kyle Kovacs ALL RIGHTS RESERVED
                </div>
            </>
        );
    };
}
