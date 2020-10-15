import React, { Component } from 'react';
import Joke from './Joke'
import axios from 'axios';
import uuid from 'uuid/v4'
import './JokeList.css'




class JokeList extends Component {
    //number of jokes we're getting won't change, so can set as static default props
    static defaultProps = {
        numJokesToGet: 10
    };
    constructor(props) {
        super(props);
        //this line says 'if there are jokes in local storage use those, if not, jokes is set to an empty array as it was in the original code w/o local storage. 
        this.state = {
            jokes: JSON.parse(window.localStorage.getItem('jokes') || '[]')
        };
        this.handleClick = this.handleClick.bind(this);
    };
    componentDidMount() {
        //component did mount now only loads new jokes IF local storage is empty
        if(this.state.jokes.length === 0) this.getJokes();
    }
        async getJokes() {
            let jokes = [];
            while(jokes.length < this.props.numJokesToGet) {
                let res = await axios.get('https://icanhazdadjoke.com', {
                    headers: {Accept: 'application/json'}
                });
                jokes.push({id: uuid(), text: res.data.joke, votes: 0});
            }
            this.setState({ jokes: jokes});
            window.localStorage.setItem(
                "jokes",
                JSON.stringify(jokes)
            )

    };
    handleVote(id, delta) {
        this.setState(st => ({
            jokes: st.jokes.map(j => 
               j.id === id ? {...j, votes: j.votes + delta} : j 
            )
        }));
    }
    handleClick() {

    }
    render() {
        return (
            <div className='JokeList'>
                <div className='JokeList-sidebar'>
                    <h1 className='JokeList-title'><span>Dad</span> Jokes</h1>
                    <img 
                        src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg'
                        alt='laughing emoji'
                    />
                    <button className='JokeList-getmore' onClick={this.handleClick}>New Jokes</button>
                </div>
                
                <div className='JokeList-jokes'>
                    {this.state.jokes.map( j => (
                        <Joke key={j.id} 
                            votes={j.votes} 
                            text={j.text} 
                            upvote={() => this.handleVote(j.id, 1)} 
                            downvote={() => this.handleVote(j.id, -1)}
                        />
                    ))}
                </div>
            </div>
        )
    };
};



export default JokeList;