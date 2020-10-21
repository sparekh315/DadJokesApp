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
            jokes: JSON.parse(window.localStorage.getItem('jokes') || '[]'),
            loading: false
        };
        //this creates a set to be able to see if there are any duplicate jokes. A set is more efficient for run time. We map over each joke and only pull the text into the set. 
        this.seenJokes = new Set(this.state.jokes.map(j => j.text));
        this.handleClick = this.handleClick.bind(this);
    };
    componentDidMount() {
        //component did mount now only loads new jokes IF local storage is empty
        if(this.state.jokes.length === 0) this.getJokes();
    }
        async getJokes() {
            //try and catch error included in code to alert when data/url/etc not laoding correctly.
            try {
            let jokes = [];
            //this particular api needed a headers tag to not return a html document but JSON data instead per the instructions on the api webesite. 
            while(jokes.length < this.props.numJokesToGet) {
                let res = await axios.get('https://icanhazdadjoke.com', {
                    headers: {Accept: 'application/json'}
                });
                //this is a variable set to the data for jokes from the api. If the new joke coming in does not match any other jokes already in the jokes array, it will be pushed in. If it does, it won't be pushed into the array, and a console log will display the duplicate joke. The while loop will keep running when jokes.length is less than 10, so another joke will be fetched in it's place. 
                let newJoke = res.data.joke;
                if(!this.seenJokes.has(newJoke)) {
                    jokes.push({id: uuid(), text: res.data.joke, votes: 0});
                } else {
                    console.log('FOUND A DUPLICATE JOKE')
                    console.log(newJoke)
                }
               
            }
            this.setState(
                st => ({
                    //previous jokes in state + new jokes after pushing get new jokes button (which just calls this funciton), the logic is set here
                    //loading is set to false after jokes are jokes are gotten so that spinner doesn't show and updated list of jokes shows. 
                    loading: false,
                    jokes: [...st.jokes, ...jokes]
                }),
                () =>
                    window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
            );
            } catch(e) {
                alert(e);
                this.setState({loading: false});
            }

    };
    handleVote(id, delta) {
        this.setState(st => ({
            jokes: st.jokes.map(j => 
               j.id === id ? {...j, votes: j.votes + delta} : j 
            )
        }),
        //this keeps upvote/downvote in local storage after the setState runs instead of it erasing when page is refreshed. 
        () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
        );
    }
    handleClick() {
        //the logic for this is in the get jokes function
        //this updates state to set loading to true for the spinner when get new jokes button is clicked, then it runs getJokes as a callback function to get the new jokes to add to state after the spinner shows.
        this.setState({loading: true }, this.getJokes);
    }
    render() {
        //the logic here says if loading is true, then show the spinner. If not, show the jokelist. The spinner is a smiley face from font awesome. It is set to 8x the size, and to spin as an animation in the className line of code (no animation CSS needed!). Then an H1 that says laoding and is styled using same css as JokeList title. 
        if(this.state.loading) {
            return (
                <div className='JokeList-spinner'>
                    <i className='far fa-8x fa-laugh fa-spin' />
                    <h1 className='JokeList-title'>Loading...</h1>
                </div>
            )
        };
        //this sorts the jokes in order of number of votes a and b passed in as arguments, then logic is b votes - a votes. This array is then used in the map statement in the jokes list instead of the unsorted original jokes array from state. 
        let sortedJokes = this.state.jokes.sort((a,b) => b.votes - a.votes)
        return (
            <div className='JokeList'>
                <div className='JokeList-sidebar'>
                    <h1 className='JokeList-title'><span>Dad</span> Jokes</h1>
                    <img 
                        src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg'
                        alt='laughing emoji'
                    />
                    <button className='JokeList-getmore' onClick={this.handleClick}>Get New Jokes</button>
                </div>
                
                <div className='JokeList-jokes'>
                    {sortedJokes.map( j => (
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