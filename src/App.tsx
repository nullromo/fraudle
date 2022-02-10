import React from 'react';
import moment from 'moment';

const EXPLANATION = (
    <div className='explanation'>
        Are your friends all playing Wordle and sending you their emoji squares
        all the time?
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

const YELLOW = '🟨';
const GREEN = '🟩';
const GRAY = '⬜';

type EmptyProps = Record<string, unknown>;
//type EmptyState = Record<string, never>;

const generateGrid = (selectedLevel: number, hardMode: boolean) => {
    const isRowValid = (row: string[]) => {
        if (
            row.every((square) => {
                return square === GREEN;
            })
        ) {
            return false;
        }
        let greens = 0;
        let yellows = 0;
        row.forEach((square) => {
            if (square === GREEN) {
                greens += 1;
            }
            if (square === YELLOW) {
                yellows += 1;
            }
        });
        if (greens === 4 && yellows === 1) {
            return false;
        }
        return true;
    };
    const grid = [...Array(selectedLevel)].map((_, i) => {
        const grayThreshold = 0.6 - i * 0.1;
        const yellowThreshold = 0.9 - i * 0.1;
        const chooseColor = () => {
            const randomNumber = Math.random();
            if (randomNumber < grayThreshold) {
                return GRAY;
            }
            if (randomNumber < yellowThreshold) {
                return YELLOW;
            }
            return GREEN;
        };
        let row;
        do {
            row = [
                chooseColor(),
                chooseColor(),
                chooseColor(),
                chooseColor(),
                chooseColor(),
            ];
        } while (!isRowValid(row));
        return row;
    });
    grid[selectedLevel - 1] = [GREEN, GREEN, GREEN, GREEN, GREEN];
    return grid;
};

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
        const grid = generateGrid(
            this.state.selectedLevel,
            this.state.hardMode,
        );
        const gridText = grid
            .map((line) => {
                return line.join('');
            })
            .join('\n');
        const output = `Wordle ${moment().diff(
            moment('20210619', 'YYYYMMDD'),
            'days',
        )} ${this.state.selectedLevel}/6\n\n${gridText}`;
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
