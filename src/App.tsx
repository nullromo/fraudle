import React from 'react';
import moment from 'moment';

const YELLOW = '🟨';
const GREEN = '🟩';
const GRAY = '⬜';

type EmptyProps = Record<string, unknown>;
//type EmptyState = Record<string, never>;

interface AppState {
    output: string;
    selectedLevel: number;
}

export class App extends React.Component<EmptyProps, AppState> {
    public constructor(props: EmptyProps) {
        super(props);
        this.state = {
            output: '',
            selectedLevel: 3,
        };
    }

    private readonly generate = () => {
        const grid = [...Array(this.state.selectedLevel)].map((_, i) => {
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
            } while (
                row.every((square) => {
                    return square === GREEN;
                })
            );
            return row;
        });
        grid[this.state.selectedLevel - 1] = [
            GREEN,
            GREEN,
            GREEN,
            GREEN,
            GREEN,
        ];
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
        return (
            <>
                Choose your skill level
                <br />
                <select
                    onChange={(event) => {
                        this.setState({
                            selectedLevel: Number(event.target.value),
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
                <button type='button' onClick={this.generate}>
                    Play
                </button>
                <br />
                <textarea value={this.state.output} rows={9}></textarea>
                <div hidden={!this.state.output}>
                    Nice work. Now tell all your friends.
                </div>
            </>
        );
    };
}
