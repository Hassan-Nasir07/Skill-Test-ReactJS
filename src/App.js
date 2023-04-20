import './App.css';
import unknown from './images/grey.png';
import bHole1 from './images/Bhole1.png';
import bHole2 from './images/Bhole2.png';
import bHole3 from './images/Bhole3.png';
import bHole4 from './images/Bhole4.png';
import bHole5 from './images/Bhole5.png';
import bHole6 from './images/Bhole6.png';
import bHole7 from './images/Bhole7.png';
import bHole8 from './images/Bhole8.png';
import bronze from './images/BronzeStar.png';
import silver from './images/SilverStar.png';
import gold from './images/GoldStar.png';
import platinum from './images/Platinum.png';
import diamond from './images/Diamond.png';
import ace from './images/Ace.png';
import fail from './images/Fail.png';
import ReactDOM from 'react-dom/client';
import React from "react";
import { useState, useEffect, useRef } from "react";
import useLocalStorage from './useLocalStorage';

   
function App() {
    const [visible, setVisible] = useState(true);
    const [count, setCount] = useState(0);
    const Ref = useRef(null);
    const btnRef = useRef(null);
    const [newG, setNewG] = useState(true);
    const [highscoreGame1, setHighscore] = useLocalStorage('precisionhighscore', localStorage.getItem('precisionhighscore'));
    const [timer, setTimer] = useState('00:30');
    const [bulletHoleX, setBulletHoleX] = useState(0);
    const [bulletHoleY, setBulletHoleY] = useState(0);
    const [showBulletHole, setShowBulletHole] = useState(false);
    const [bulletHoleImage, setBulletHoleImage] = useState(null);
    const [bulletHoles, setBulletHoles] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [leadopenFlag , setLeadOpen] = useState(false);
    const [playerName, setPlayerName] = useState("");
    const nameInputRef = useRef(null);
    const [existingPlayers , setExistingPlayers] = useLocalStorage('hitplayers',[]);
    const [showpopup, setShowPopUp] = useState(false);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };
    const getTimeRemaining = (e) => {
        const total = Date.parse(e) - Date.parse(new Date());
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const hours = Math.floor((total / 1000 / 60 / 60) % 24);
        return {
            total, hours, minutes, seconds
        };
    }
    const startTimer = (e) => {
        let { total, hours, minutes, seconds }
            = getTimeRemaining(e);
        if (total >= 0) {

            // update the timer
            // check if less than 10 then we need to 
            // add '0' at the beginning of the variable
            setTimer(
                (minutes > 9 ? minutes : '0' + minutes) + ':' + (seconds > 9 ? seconds : '0' + seconds)
            )
        }
    }
    const clearTimer = (e) => {

        // If you adjust it you should also need to
        // adjust the Endtime formula we are about
        // to code next    
        setTimer('00:30');

        // If you try to remove this line the 
        // updating of timer Variable will be
        // after 1000ms or 1sec
        if (Ref.current) clearInterval(Ref.current);
        const id = setInterval(() => {
            startTimer(e);
        }, 1000)
        Ref.current = id;
    }
    const getDeadTime = () => {
        let deadline = new Date();

        // This is where you need to adjust if 
        // you entend to add more time
        deadline.setSeconds(deadline.getSeconds() + 30);
        return deadline;
    }
    const onClickReset = () => {
        clearTimer(getDeadTime());
    }
    

    // X
    const [x, setX] = useState();

    // Y
    const [y, setY] = useState();
    const getPosition = () => {
        const x = btnRef.current.offsetLeft;
        setX(x);

        const y = btnRef.current.offsetTop;
        setY(y);
    };
    // Get the position of the button in the beginning
    useEffect(() => {
        getPosition();
        const handleResize = () => {
            getPosition();
        };
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);
    useEffect(() => {
        const maxX = window.innerWidth - btnRef.current.offsetWidth;
        const maxY = window.innerHeight - btnRef.current.offsetHeight;

        let posX = Math.floor(Math.random() * maxX);
        let posY = Math.floor(Math.random() * maxY);

        // Check if new position is outside of screen bounds
        if (posX < 0) posX = 0;
        if (posY < 0) posY = 0;
        if (posX > maxX) posX = maxX;
        if (posY > maxY) posY = maxY;

        btnRef.current.style.top = posY + "px";
        btnRef.current.style.left = posX + "px";
    }, []);
    useEffect(() => {
        const button = btnRef.current;
        button.addEventListener("resize", getPosition);
        return () => {
            button.removeEventListener("resize", getPosition);
        }
    }, [btnRef.current]);
    const bHoles = [
        bHole1,
        bHole2,
        bHole3,
        bHole4,
        bHole5,
        bHole6,
        bHole7,
        bHole8
    ];
    const handleClick = (maxX, maxY) => {
        let posX = Math.floor(Math.random() * maxX);
        let posY = Math.floor(Math.random() * maxY);
        // Keep the button inside the bounds of the screen
        posX = Math.min(Math.max(posX, 20), maxX);
        posY = Math.min(Math.max(posY, 80), maxY);

        requestAnimationFrame(() => {
            btnRef.current.style.top = `${posY}px`;
            btnRef.current.style.left = `${posX}px`;
        });

        if (visible===true) {
            document.querySelector('.buttonT').style.position = 'static';
        }
        else {
            document.querySelector('.buttonT').style.position = 'absolute';
            setCount((c) => c + 1);
        }
    };
    const bullethole=(event) => {
        const X = event.clientX;
        const Y = event.clientY;
        setBulletHoleX(X);
        setBulletHoleY(Y);
        const randomIndex = Math.floor(Math.random() * bHoles.length+1);
        setBulletHoleImage(bHoles[randomIndex]);
        handleBulletHole(X, Y);
        setShowBulletHole(true);
        setTimeout(() => setShowBulletHole(false), 5*1000);
    };
    const handleBulletHole = (x, y) => {
        const bullet = {
            x,
            y,
            image: bulletHoleImage,
        };
        setBulletHoles([...bulletHoles, bullet]);
    };
    const timeOver = () => {
        const myValue = parseInt(localStorage.getItem('precisionhighscore'));
        if (count > myValue || newG) { // fires if current result is better (or the code executes the first time)
            setHighscore(count);
            if(count < myValue){
                setHighscore(myValue);
            }
            if (myValue !== null) {
            console.log('myValue is being stored in localStorage '+localStorage.getItem('precisionhighscore'));
            } else {
            console.log('myValue is not being stored in localStorage');
            }
        }
        setTimer('00:30');
        setShowPopUp(true);
        setVisible(true);
        setNewG(false);
    };

    const handlePlay = () => {
        onClickReset();
        setVisible(false);
        setShowPopUp(false);
        setCount(0);
    };
    useEffect(() => {
        if (timer === '00:00' && btnRef.current) {
            btnRef.current.style.position = 'static';
            timeOver();
        }
    }, [timer]);
    const newgame = event => {
        root.render(<App2 />);
        event.currentTarget.style.display = 'none';
    };
    const movingTGame = event => {
        root.render(<App3 />);
        event.currentTarget.style.display = 'none';
    };
    const Ttest = event => {
        root.render(<TypingApp />);
        event.currentTarget.style.display = 'none';
    };
    useEffect(() => {
        existingPlayers.sort((a, b) => {
          // sort by accuracy value (descending order)
          if (a.score > b.score) return -1;
          if (a.score < b.score) return 1;
    // if all values are equal, don't change the order
    return 0;
    });
    }, [existingPlayers]);
    const topPlayers = existingPlayers.slice(0, 3);
    const openLeaderBoard = () => {
        if(leadopenFlag===false)
        {
          setLeadOpen(true);
        }   
        else{
          setLeadOpen(false);
        }
      };
      const closePopup = () => {
        const name = nameInputRef.current.value.trim().toUpperCase();
        if (name.length === 0) {
            alert("Name cannot be empty!");
        } else if (name.length > 20) {
            alert("Name should not exceed 20 characters!");
        } else if (/^\d+$/.test(name)) {
            alert("Name should not contain numeric characters!");
        } else if (/[^a-zA-Z0-9]/.test(name)) {
            alert("Name should not contain special characters!");
        } else {
            setPlayerName(name);
            const playerData = {
            name : name,
            score : count
            };
            const data = localStorage.getItem('hitplayers');
            if (data) {
                setExistingPlayers(JSON.parse(data));
            }
            const updatedPlayers = [...existingPlayers, playerData];
            setExistingPlayers([...existingPlayers, playerData]);
            localStorage.setItem('hitplayers', JSON.stringify(updatedPlayers));
            setShowPopUp(false);
        }
    };
    return (
        <div className="App" onMouseDown={bullethole}>
            <header className="App-header">
                <div className="Top-Bar">
                    <span>
                        <div className="dropdown">
                        <span style={{display:'inline-flex'}}>
                            <button className="dropbtn game2" onClick={toggleDropdown}>Games</button>
                            <button className="game2" onClick={openLeaderBoard}>Leaderboard</button>
                        </span>
                            {dropdownOpen && (
                                <div className="dropdown-content">
                                    <button type="button" className="game2" onClick={newgame}>Aim✜Trainer</button>
                                    <button type="button" className="game2" onClick={movingTGame}>RefleX</button>
                                    <button type="button" className="game2" onClick={Ttest}>SpeedType</button>
                                </div>
                            )}
                        </div>
                        <label style={{ fontSize: '15px', marginRight: '20px' }}>Highscore:{highscoreGame1}</label>
                        <label id="counter">| Score {count} | Time {timer}s</label>
                    </span>
                </div>
                {leadopenFlag && (
                <div id="rgb">
                        <div id="popup">
                            <div className="topLeadersList">
                                {existingPlayers.map((leader, index) => (
                                <div className="leader" key={index}>
                                    {topPlayers.includes(leader) && (
                                    <div className="containerImage">
                                        <img className="image" loading="lazy" src={unknown} />
                                        <div className="crown">
                                        <svg
                                            id="crown1"
                                            fill="#0f74b5"
                                            data-name="Layer 1"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 100 50"
                                        >
                                            <polygon
                                            className="cls-1"
                                            points="12.7 50 87.5 50 100 0 75 25 50 0 25.6 25 0 0 12.7 50"
                                            />
                                        </svg>
                                        </div>
                                        <div className="leaderName">{leader.name}</div>
                                    </div>
                                    )}
                                </div>
                                ))}
                            </div>
                            <div className="playerslist">
                                <div className="table">
                                    <div>#</div>
                                
                                    <div>Name</div>
                                
                                
                                    <div>Score</div>
                                </div>
                                <div className="list">
                                {existingPlayers.map((leader, index) => (
                                    <div className="player" key={index}>
                                    <span style={{fontSize:'1.8vh'}}> {index + 1}</span>
                                    <div className="user">
                                        <img className="image" src={unknown} />
                                        <span> {leader.name} </span>
                                    </div>
                                    <span> {leader.score} </span>
                                    </div>
                                ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {showpopup && 
                (<div id="rgb">
                    <div id="popup">
                        <h2>YOU SCORED {count} Points!</h2>
                        <span id='difbtnSpace'>
                            <input type="text" id="txtname" onKeyDown={() => nameInputRef.current.focus()} placeholder="Enter Your Name" ref={nameInputRef} />
                            <button onClick={closePopup}>OK</button>
                        </span>
                    </div>
                </div>
                )}
                <button type="button" ref={btnRef} name="target" style={{position: visible ? 'static' : 'absolute'}} className="buttonT" onMouseDown={() => handleClick(window.innerWidth - 100, window.innerHeight - 100)}>⊹</button>
                {visible && <button type="button" name="resetBtn" className="resetBtn" onClick={handlePlay}>Play</button>}
                {bulletHoles.map((bulletHole, index) => (
                    bulletHole.image && // check if the image exists
                    <img
                        key={index}
                        className="Bhole"
                        src={bulletHole.image}
                        style={{ position: 'absolute', left: bulletHole.x - 9, top: bulletHole.y - 9 }}
                        onAnimationEnd={() => {
                            setTimeout(() => {
                                const newBulletHoles = [...bulletHoles];
                                newBulletHoles.splice(index, 1);
                                setBulletHoles(newBulletHoles);
                              }, 50);
                        }}
                    />
                ))}
            </header>
        </div>
    );
}
function App2() {
    const [sum, setSum] = useState(0);
    const [startTime, setStartTime] = useState(Date.now());
    const [endTime, setEndTime] = useState(Date.now());
    const [time, setTime] = useState(Date.now());
    const [visible, setVisible] = React.useState(true);
    const [count, setCount] = useState(30);
    const [flag, setFlag] = useState(false);
    const [avg, setAvg] = useState(0);
    const [reactionArr, setReactArr] = useState([]);
    const [highscoreGame2, setHigh] = useLocalStorage('aimhighscore', localStorage.getItem('aimhighscore'));
    const [init, setInit] = useState(true);
    const btnRef = useRef(null);
    const [x, setX] = useState();
    const [y, setY] = useState();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [leadopenFlag , setLeadOpen] = useState(false);
    const [playerName, setPlayerName] = useState("");
    const nameInputRef = useRef(null);
    const [existingPlayers , setExistingPlayers] = useLocalStorage('aimplayers',[]);
    const [showpopup, setShowPopUp] = useState(false); 

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };
    const getPosition = () => {
        const x = btnRef.current.offsetLeft;
        setX(x);

        const y = btnRef.current.offsetTop;
        setY(y);
    };
    useEffect(() => {
        getPosition();
        const handleResize = () => {
            getPosition();
        };
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);
    useEffect(() => {
        const maxX = window.innerWidth - btnRef.current.offsetWidth;
        const maxY = window.innerHeight - btnRef.current.offsetHeight;

        let posX = Math.floor(Math.random() * maxX);
        let posY = Math.floor(Math.random() * maxY);

        // Check if new position is outside of screen bounds
        if (posX < 0) posX = 0;
        if (posY < 0) posY = 0;
        if (posX > maxX) posX = maxX;
        if (posY > maxY) posY = maxY;

        btnRef.current.style.top = posY + "px";
        btnRef.current.style.left = posX + "px";
    }, []);

    useEffect(() => {
        const button = btnRef.current;
        button.addEventListener("resize", getPosition);
        if (count == 30) {
            btnRef.current.style.position = 'static';
        }
        return () => {
            button.removeEventListener("resize", getPosition);
        }
    }, [btnRef.current]);
    const checkCount = () => {
        if (count === 0) {
            setVisible(true);
            const totalReactionTime = reactionArr.reduce((acc, curr) => acc + curr, 0);
            const avgReactionTime = Math.round(totalReactionTime / reactionArr.length);
            setAvg(avgReactionTime);
        }
    };
    const handleClick = (maxX, maxY) => {
        handleMouseDown();
        chkClick();
        setVisible(false);
        let posX = Math.floor(Math.random() * maxX);
        let posY = Math.floor(Math.random() * maxY);

        // Keep the button inside the bounds of the screen
        posX = Math.min(Math.max(posX, 20), maxX);
        posY = Math.min(Math.max(posY, 80), maxY);

        requestAnimationFrame(() => {
            btnRef.current.style.top = `${posY}px`;
            btnRef.current.style.left = `${posX}px`;
        });

        if (count === 1) {
            btnRef.current.style.position = 'static';
            setVisible(true);
            setShowPopUp(true);
            setCount(30);
            const sum = reactionArr.reduce((total, reactionTime) => total + reactionTime, 0);
            const avg = Math.round(Math.floor(sum / reactionArr.length));
            setAvg(avg);
            const myValue = parseInt(localStorage.getItem('aimhighscore'));
            if (avg < myValue || init == true) {
                setHigh(avg);
                if(avg < myValue){
                    setHigh(avg);
                }
            }
            
            setInit(false);
        } else {
            document.querySelector('.buttonT').style.position = 'absolute';
            setCount((c) => c - 1);
        }
        checkCount();
    };

    const onClick = () => {
        if (startTime) {
            const endTime = Date.now();
            const reactionTime = endTime - startTime;
            setEndTime(endTime);
            setReactArr((reactionArr) => [...reactionArr, reactionTime]);
            setStartTime(null);
        }
    };
    const handleMouseDown = () => {
        setStartTime(Date.now());
    }

    const handleMouseUp = () => {
        onClick();
    }

    const chkClick = () => {
        setFlag((prevFlag) => {
            if (prevFlag) {
                onClick();
            } else {
                setStartTime(Date.now());
            }
            return !prevFlag;
        });
    };
    const handlePlay = () => {
        setVisible(false);
        setSum(0);
        setStartTime(Date.now());
        setEndTime(Date.now());
        setTime(Date.now());
        setVisible(false);
        setCount(30);
        setFlag(false);
        setAvg(0);
        setReactArr([]);
        setX(0); // added to reset X position
        setY(0); // added to reset Y position
        document.getElementsByClassName('buttonT').style.position = "absolute";
    };
    const newGame = (event) => {
        root.render(<App />); // opens another game
        event.currentTarget.style.display = 'none';
    };
    const Mtarget = (event) => {
        root.render(<App3 />); // opens another game
        event.currentTarget.style.display = 'none';
    };
    const Ttest = event => {
        root.render(<TypingApp />);
        event.currentTarget.style.display = 'none';
    };

    useEffect(() => {
        existingPlayers.sort((a, b) => {
          // sort by accuracy value (descending order)
          if (a.react < b.react) return -1;
          if (a.react > b.react) return 1;
    // if all values are equal, don't change the order
    return 0;
    });
    }, [existingPlayers]);
    const topPlayers = existingPlayers.slice(0, 3);
    const openLeaderBoard = () => {
        if(leadopenFlag===false)
        {
          setLeadOpen(true);
        }   
        else{
          setLeadOpen(false);
        }
      };
      const closePopup = () => {
        const name = nameInputRef.current.value.trim().toUpperCase();
        if (name.length === 0) {
            alert("Name cannot be empty!");
        } else if (name.length > 20) {
            alert("Name should not exceed 20 characters!");
        } else if (/^\d+$/.test(name)) {
            alert("Name should not contain numeric characters!");
        } else if (/[^a-zA-Z0-9]/.test(name)) {
            alert("Name should not contain special characters!");
        } else {
            setPlayerName(name);
            const playerData = {
            name : name,
            react : avg
            };
            const data = localStorage.getItem('aimplayers');
            if (data) {
                setExistingPlayers(JSON.parse(data));
            }
            const updatedPlayers = [...existingPlayers, playerData];
            setExistingPlayers([...existingPlayers, playerData]);
            localStorage.setItem('aimplayers', JSON.stringify(updatedPlayers));
            setShowPopUp(false);
        }
    };     

    return (
        <div className="App">
            <header className="App-header">
                <div className="Top-Bar">
                    <span>
                        <div className="dropdown">
                        <span style={{display:'inline-flex'}}>
                            <button className="dropbtn game2" onClick={toggleDropdown}>Games</button>
                            <button className="game2" onClick={openLeaderBoard}>Leaderboard</button>
                        </span>  
                            {dropdownOpen && (
                                <div className="dropdown-content">
                                    <button type="button" className="game2" onClick={newGame}>Precision</button>
                                    <button type="button" className="game2" onClick={Mtarget}>RefleX</button>
                                    <button type="button" className="game2" onClick={Ttest}>SpeedType</button>
                                </div>
                            )}
                        </div>
                        <label>Average reaction time: {reactionArr.length > 0 ? Math.floor(reactionArr.reduce((a, b) => a + b) / reactionArr.length) : '-'}</label>
                    </span>
                    <span>
                        <label>Highscore: {highscoreGame2 == 0 ? "N/A " : `${highscoreGame2}ms `}</label>
                        <label id="counter" onLoad={checkCount}>
                           | Avg. Time Taken {avg} ms | Targets {count}
                        </label>
                    </span>
                </div>
                {leadopenFlag && (
                <div id="rgb">
                        <div id="popup">
                            <div className="topLeadersList">
                                {existingPlayers.map((leader, index) => (
                                <div className="leader" key={index}>
                                    {topPlayers.includes(leader) && (
                                    <div className="containerImage">
                                        <img className="image" loading="lazy" src={unknown} />
                                        <div className="crown">
                                        <svg
                                            id="crown1"
                                            fill="#0f74b5"
                                            data-name="Layer 1"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 100 50"
                                        >
                                            <polygon
                                            className="cls-1"
                                            points="12.7 50 87.5 50 100 0 75 25 50 0 25.6 25 0 0 12.7 50"
                                            />
                                        </svg>
                                        </div>
                                        <div className="leaderName">{leader.name}</div>
                                    </div>
                                    )}
                                </div>
                                ))}
                            </div>
                            <div className="playerslist">
                                <div className="table">
                                    <div>#</div>
                                
                                    <div>Name</div>
                                
                                
                                    <div>Reaction Time</div>
                                </div>
                                <div className="list">
                                {existingPlayers.map((leader, index) => (
                                    <div className="player" key={index}>
                                    <span style={{fontSize:'1.8vh'}}> {index + 1}</span>
                                    <div className="user">
                                        <img className="image" src={unknown} />
                                        <span> {leader.name} </span>
                                    </div>
                                    <span> {leader.react}ms </span>
                                    </div>
                                ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {showpopup && 
                (<div id="rgb">
                    <div id="popup">
                        <h2>Average Reaction Time : {avg}ms!</h2>
                        <span id='difbtnSpace'>
                            <input type="text" id="txtname" onKeyDown={() => nameInputRef.current.focus()} placeholder="Enter Your Name" ref={nameInputRef} />
                            <button onClick={closePopup}>OK</button>
                        </span>
                    </div>
                </div>
                )}
                <button type="button" ref={btnRef} name="target" className="buttonT" onMouseDown={() => handleClick(window.innerWidth - 100, window.innerHeight - 200)} onMouseUp={handleMouseUp} >⊹</button>
                {visible && < button type="button" name="resetBtn" className="resetBtn" style={{ display: visible ? 'block' : 'none' }} onClick={handlePlay}>Play</button>}

            </header>
        </div>
    );
}
function App3() {
    const [visible, setVisible] = React.useState(true);
    const [count, setCount] = useState(0);
    const Ref = useRef(null);
    const btnRef = useRef(null);
    const [newG, setNewG] = useState(true);
    const [highscoreGame, setHighscore] = useLocalStorage('reflexhighscore', localStorage.getItem('reflexhighscore'));
    const [timer, setTimer] = useState('01:00');
    const [bulletHoleX, setBulletHoleX] = useState(0);
    const [bulletHoleY, setBulletHoleY] = useState(0);
    const [showBulletHole, setShowBulletHole] = useState(false);
    const [bulletHoleImage, setBulletHoleImage] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [bulletHoles, setBulletHoles] = useState([]);
    const [buttons, setButtons] = useState([]);
    const [buttonCount, setButtonCount] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [leadopenFlag , setLeadOpen] = useState(false);
    const [playerName, setPlayerName] = useState("");
    const nameInputRef = useRef(null);
    const [existingPlayers , setExistingPlayers] = useLocalStorage('reflexplayers',[]);
    const [showpopup, setShowPopUp] = useState(false); 

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };
    const getTimeRemaining = (e) => {
        const total = Date.parse(e) - Date.parse(new Date());
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const hours = Math.floor((total / 1000 / 60 / 60) % 24);
        return {
            total, hours, minutes, seconds
        };
    }
    const startTimer = (e) => {
        let { total, hours, minutes, seconds }
            = getTimeRemaining(e);
        if (total >= 0) {

            // update the timer
            // check if less than 10 then we need to 
            // add '0' at the beginning of the variable
            setTimer(
                (minutes > 9 ? minutes : '0' + minutes) + ':' + (seconds > 9 ? seconds : '0' + seconds)
            )
        }
    }
    const clearTimer = (e) => {

        // If you adjust it you should also need to
        // adjust the Endtime formula we are about
        // to code next    
        setTimer('01:00');

        // If you try to remove this line the 
        // updating of timer Variable will be
        // after 1000ms or 1sec
        if (Ref.current) clearInterval(Ref.current);
        const id = setInterval(() => {
            startTimer(e);
        }, 1000)
        Ref.current = id;
    }
    const getDeadTime = () => {
        let deadline = new Date();

        // This is where you need to adjust if 
        // you entend to add more time
        deadline.setSeconds(deadline.getSeconds() + 60);
        return deadline;
    }
    const onClickReset = () => {
        clearTimer(getDeadTime());
    }


    // X
    const [x, setX] = useState();

    // Y
    const [y, setY] = useState();
    const bHoles = [
        bHole1,
        bHole2,
        bHole3,
        bHole4,
        bHole5,
        bHole6,
        bHole7,
        bHole8
    ];
    const bullethole = (event) => {
        const X = event.clientX;
        const Y = event.clientY;
        setBulletHoleX(X);
        setBulletHoleY(Y);
        const randomIndex = Math.floor(Math.random() * bHoles.length);
        setBulletHoleImage(bHoles[randomIndex]);
        handleBulletHole(X, Y);
        setShowBulletHole(true);
        setTimeout(() => setShowBulletHole(false), 5 * 1000);
    };
    const handleBulletHole = (x, y) => {
        const bullet = {
            x,
            y,
            image: bulletHoleImage,
        };
        setBulletHoles([...bulletHoles, bullet]);
    };
    const timeOver = () => {
        const myValue = parseInt(localStorage.getItem('reflexhighscore'));
        if (count > myValue || newG) { // fires if current result is better (or the code executes the first time)
            setHighscore(count);
            if(count < myValue)
            {
                setHighscore(myValue);
            }
        }
        const buttons = document.querySelectorAll('.buttonVanish');
        buttons.forEach(button => button.style.display = 'none');
        setTimer('01:00');
        setShowPopUp(true);
        setVisible(true);
        setNewG(false);
    };

    const handlePlay = event => {
        onClickReset();
        setVisible(false);
        setCount(0);
        setIsPlaying(true);
        const newButtons = generateButtons(1);
        setButtons(newButtons);
    };
    useEffect(() => {
        if (timer === '00:00') {
            //btnRef.current.style.position = 'static';
            timeOver();
            setIsPlaying(false);
        }
    }, [timer]);
    const newgame = event => {
        root.render(<App2 />);
        event.currentTarget.style.display = 'none';
    };
    const HCount = event => {
        root.render(<App />);
        event.currentTarget.style.display = 'none';
    };
    const Ttest = event => {
        root.render(<TypingApp />);
        event.currentTarget.style.display = 'none';
    };
    // function to handle target movement
    const moveTarget = () => {
        setInterval(() => {
            let xx = Math.random() * window.innerWidth
            let yy = Math.random() * window.innerHeight

            const newX = Math.floor(xx > window.innerWidth / 2 ? xx - 70 : xx + 70);
            const newY = Math.floor(yy > window.innerHeight / 2 ? yy - 70 : yy + 70);
            setX(newX);
            setY(newY);
        }, 3500);
    };  
    
    const generateButtons = (count) => {
        const newButtons = [];
        for (let i = 0; i < count; i++) {
          const interval = Math.floor(Math.random() * 3000) + 1000; // random interval between 1 and 4 seconds
          const newButton = {
            id: Math.random().toString(),
            top: `${Math.random() * 80}%`,
            left: `${Math.random() * 80}%`,
            interval: interval // add interval property to button object
          };
          newButtons.push(newButton);
        }
        return newButtons;
      };
    const maxButtons = 5;
    useEffect(() => {
    if (isPlaying) 
    {
        const buttonCount = Math.floor(Math.random() * 3) + 1;
        const currentButtonCount = buttons.length;
        const newButtonCount = currentButtonCount + buttonCount > maxButtons ? maxButtons - currentButtonCount : buttonCount;
        const newButtons = generateButtons(newButtonCount);
        setButtons((buttons) => [...buttons, ...newButtons]);
    
        // set interval for each button using its own interval property
        const intervalIds = newButtons.map((button) => {
        return setInterval(() => {
            const newButton = {
            id: Math.random().toString(),
            top: `${Math.random() * 80}%`,
            left: `${Math.random() * 80}%`,
            interval: button.interval // use button's own interval property
            };
            setButtons((buttons) => {
                const updatedButtons = buttons.filter((b) => b.id !== button.id);
                return [...updatedButtons, newButton];
                });
        }, button.interval);
        });
    
        // clear intervals when component unmounts
        return () => {
        intervalIds.forEach((intervalId) => clearInterval(intervalId));
        };
    }
    }, [isPlaying,buttons]);

    // function to handle what happens when the target is clicked
    const handleClick = (buttonId) => {
        const remainingButtons = buttons.filter(button => button.id !== buttonId);
        const newButton = {
        id: Math.random().toString(),
        top: `${Math.random() * 80}%`,
        left: `${Math.random() * 80}%`
        };
        setButtons([...remainingButtons, newButton]);
        setCount(count + 1);
        let xx = Math.random() * window.innerWidth;
        let yy = Math.random() * window.innerHeight;

        const newX = Math.floor(xx > window.innerWidth/2 ? xx - 70 : xx + 70);
        const newY = Math.floor(yy > window.innerHeight/2 ? yy - 70 : yy + 70);
        setX(newX);
        setY(newY);
        //setTimeout(() => {
        //}, 2000);
    };

    useEffect(() => {
        document.addEventListener('mousemove', e => {
            if (e.clientX < 38) {
                //cursor.style.left  = `37px`;
            }
    })
        moveTarget();
     }, []);

    useEffect(() => {
        existingPlayers.sort((a, b) => {
          // sort by accuracy value (descending order)
          if (a.score > b.score) return -1;
          if (a.score < b.score) return 1;
    // if all values are equal, don't change the order
    return 0;
    });
    }, [existingPlayers]);

    const topPlayers = existingPlayers.slice(0, 3);
    const openLeaderBoard = () => {
        if(leadopenFlag===false)
        {
          setLeadOpen(true);
        }   
        else{
          setLeadOpen(false);
        }
      };
    const closePopup = () => {
        const name = nameInputRef.current.value.trim().toUpperCase();
        if (name.length === 0) {
            alert("Name cannot be empty!");
        } else if (name.length > 20) {
            alert("Name should not exceed 20 characters!");
        } else if (/^\d+$/.test(name)) {
            alert("Name should not contain numeric characters!");
        } else if (/[^a-zA-Z0-9]/.test(name)) {
            alert("Name should not contain special characters!");
        } else {
            setPlayerName(name);
            const playerData = {
            name : name,
            score : count
            };
            const data = localStorage.getItem('reflexplayers');
            if (data) {
                setExistingPlayers(JSON.parse(data));
            }
            const updatedPlayers = [...existingPlayers, playerData];
            setExistingPlayers([...existingPlayers, playerData]);
            localStorage.setItem('reflexplayers', JSON.stringify(updatedPlayers));
            setShowPopUp(false);
        }
    };     

    return (
        <div className="App" onMouseDown={bullethole}>
            <header className="App-header" >
                <div className="Top-Bar">
                    <span>
                        <div className="dropdown">
                        <span style={{display:'inline-flex'}}>
                            <button className="dropbtn game2" onClick={toggleDropdown}>Games</button>
                            <button className="game2" onClick={openLeaderBoard}>Leaderboard</button>
                        </span> 
                            {dropdownOpen && (
                                <div className="dropdown-content">
                                    <button type="button" className="game2" onClick={HCount}>Precision</button>
                                    <button type="button" className="game2" onClick={newgame}>Aim✜Trainer</button>
                                    <button type="button" className="game2" onClick={Ttest}>SpeedType</button>
                                </div>
                            )}
                        </div>
                        <label style={{ fontSize: '15px', marginRight: '20px' }}>Highscore:{highscoreGame}</label>
                        <label id="counter">| Score {count} | Time {timer}</label>
                    </span>
                </div>
                {leadopenFlag && (
                <div id="rgb">
                        <div id="popup">
                            <div className="topLeadersList">
                                {existingPlayers.map((leader, index) => (
                                <div className="leader" key={index}>
                                    {topPlayers.includes(leader) && (
                                    <div className="containerImage">
                                        <img className="image" loading="lazy" src={unknown} />
                                        <div className="crown">
                                        <svg
                                            id="crown1"
                                            fill="#0f74b5"
                                            data-name="Layer 1"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 100 50"
                                        >
                                            <polygon
                                            className="cls-1"
                                            points="12.7 50 87.5 50 100 0 75 25 50 0 25.6 25 0 0 12.7 50"
                                            />
                                        </svg>
                                        </div>
                                        <div className="leaderName">{leader.name}</div>
                                    </div>
                                    )}
                                </div>
                                ))}
                            </div>
                            <div className="playerslist">
                                <div className="table">
                                    <div>#</div>
                                
                                    <div>Name</div>
                                
                                
                                    <div>Score</div>
                                </div>
                                <div className="list">
                                {existingPlayers.map((leader, index) => (
                                    <div className="player" key={index}>
                                    <span style={{fontSize:'1.8vh'}}> {index + 1}</span>
                                    <div className="user">
                                        <img className="image" src={unknown} />
                                        <span> {leader.name} </span>
                                    </div>
                                    <span> {leader.score} </span>
                                    </div>
                                ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {showpopup && 
                (<div id="rgb">
                    <div id="popup">
                        <h2>YOU SCORED {count} Points!</h2>
                        <span id='difbtnSpace'>
                            <input type="text" id="txtname" onKeyDown={() => nameInputRef.current.focus()} placeholder="Enter Your Name" ref={nameInputRef} />
                            <button onClick={closePopup}>OK</button>
                        </span>
                    </div>
                </div>
                )}
                {buttons.map(button => (
                    <button 
                    className="buttonVanish" 
                    key={button.id} 
                    onClick={() => handleClick(button.id)} 
                    style={{ position: visible ? 'static' : 'absolute', top: button.top, left: button.left }}
                    >
                    ⊹
                    </button>
                ))}
                {visible && <button type="button" name="resetBtn" className="resetBtn" onClick={handlePlay}>Play</button>}
                {bulletHoles.map((bulletHole, index) => (
                    bulletHole.image && // check if the image exists
                    <img
                        key={index}
                        className="Bhole"
                        src={bulletHole.image}
                        style={{ position: 'absolute', left: bulletHole.x - 9, top: bulletHole.y - 9 }}
                        onAnimationEnd={() => {
                            setTimeout(() => {
                                const newBulletHoles = [...bulletHoles];
                                newBulletHoles.splice(index, 1);
                                setBulletHoles(newBulletHoles);
                              }, 50);
                        }}
                    />
                ))}
            </header>
        </div>
    );
}
function TypingApp() {
    const easyparagraphs = [
        "The quick brown fox jumps over the lazy dog. This sentence contains all the letters of the English alphabet.",
        "Did you know that the longest word in the English language is pneumonoultramicroscopicsilicovolcanoconiosis? It has 45 letters.",
        "A group of flamingos is called a flamboyance. That sounds like a fun party!",
        "The shortest complete sentence in the English language is 'I am.' That's pretty self-explanatory.",
        "Did you hear about the mathematician who's afraid of negative numbers? He'll stop at nothing to avoid them!"
    ];
    const medparagraphs = [
        "Have you ever tried to catch a squirrel? It's harder than it looks. These little critters can climb trees, jump from branch to branch, and scamper across power lines with ease. Speaking of animals, did you know that a group of flamingos is called a flamboyance? That's right, these pink birds really know how to strut their stuff.",
        "How do you make a tissue dance? You put a little boogey in it! If you're in the mood for dancing, you might want to try the cha-cha. This fun and flirty dance originated in Cuba in the 1950s and has been popular ever since. Just be careful not to step on your partner's toes!",
        "Why did the tomato turn red? Because it saw the salad dressing! Speaking of food, have you ever tried durian? This tropical fruit is famous for its pungent smell, which some people describe as similar to rotting onions or sewage. Despite its strong odor, durian is a delicacy in many parts of Southeast Asia.",
        "Did you hear about the kidnapping at the playground? They woke up! Okay, that's a terrible joke. How about this one: Why don't scientists trust atoms? Because they make up everything! Speaking of science, did you know that the largest known dinosaur was the Argentinosaurus, which weighed as much as 10 elephants? That's one big dinosaur!",
        "Why did the tomato turn red? Because it saw the salad dressing! Do you ever wonder how much salad a rabbit can eat in one sitting? It's just a lettuce! And if you ever find yourself lost in a cornfield, don't worry - you'll always find your way out, because corn has ears.",
        "Did you hear about the man who stole a calendar? He got twelve months. But if you think that's bad, have you ever tried to eat a clock? It's very time-consuming. And don't get me started on those who use umbrellas. They always look up in the sky, wondering why the hell the raindrops keep falling on them.",
        "What do you call a bear with no teeth? A gummy bear! But if you think that's bad, have you ever heard of a mouse that can play the piano? It's all about the keys! And if you ever find yourself on a rollercoaster, just remember to scream and enjoy the ride. After all, life is like a rollercoaster - it has its ups and downs, but it's always thrilling."
    ];
    const hardParagraphs = [
        "Why was six afraid of seven? Because seven eight nine! This classic joke always gets a chuckle. Speaking of numbers, did you know that the number zero was invented in India over 1,500 years ago? It took another 500 years for the number zero to be widely used in Europe. Today, zero is an essential part of our number system. Now, if only we could figure out how to divide by zero...",
        "Did you hear about the kidnapping at the playground? They woke up! Okay, that's a terrible joke. How about this one: Why don't scientists trust atoms? Because they make up everything! Speaking of science, did you know that the largest known dinosaur was the Argentinosaurus, which weighed as much as 10 elephants? That's one big dinosaur!",
        "Why did the coffee file a police report? Because it got mugged! But it's not all bad for coffee - it's a great conversation starter. You can always ask someone if they want to grab a cup of coffee, and they'll never say no! And for all the tea lovers out there, did you know that tea is just a hug in a cup?",
        "Why did the chicken cross the playground? To get to the other slide! But watch out for those playground bullies - they always try to swing things their way. And if you ever get a chance to visit a trampoline park, don't be afraid to let loose and jump for joy. Just don't jump into the foam pit, unless you want to get lost in a sea of foam.",
        "What do you call a bear with no teeth? A gummy bear! But if you think that's bad, have you ever heard of a mouse that can play the piano? It's all about the keys! And if you ever find yourself on a rollercoaster, just remember to scream and enjoy the ride. After all, life is like a rollercoaster - it has its ups and downs, but it's always thrilling.",
        "Once upon a time, in a galaxy far, far away, there were 99,999 Coffee-loving aliens who enjoyed playing #arcade games. One day, while playing their favorite game, they discovered a secret code: 8*3+7&5%2=?. Confused but intrigued, the aliens decided to decipher the code. They typed feverishly, but to no avail. After many attempts, they finally figured out the answer: 17! Happy and satisfied, they went back to their coffee and games, until the next mystery code appeared."
    ];
    const [characters, setCharacters] = useState([]);
    const [charIndex, setCharIndex] = useState(0);
    const [errors, setErrors] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [netwpm, setNetWpm] = useState(0);
    const [wpm, setWpm] = useState(0);
    const [cpm, setCpm] = useState(0);
    const [inputValue, setInputValue] = useState("");
    const inpFieldRef = useRef(null);
    const nameInputRef = useRef(null);
    const [timer, setTimer] = useState(null);
    const [timeLeft, setTimeLeft] = useState(120);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [accuracy, setAccuracy] = useState(100);
    const [totalChars, setTotalChars] = useState(0);
    const [totalErrors, setTotalErrors] = useState(0);
    const [medalImage, setMedalImage] = useState(null);
    const [showpopup, setShowPopUp] = useState(false);
    const [congratsText,SetCongratsText] = useState("");
    const [medalName,SetMedalName] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [showDifpopup, setShowDifPopUp] = useState(true);
    const [playerName, setPlayerName] = useState("");
    const [leadopenFlag , setLeadOpen] = useState(false);
    const [existingPlayers , setExistingPlayers] = useLocalStorage('players',[]);
    const [failFlag , setFailFlag] = useState(false); 
    const [testEnded, setTestEnded] = useState(false);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    useEffect(() => {
        if (!showDifpopup) {
          loadParagraph();
        }
      }, [showDifpopup]);
    // useEffect(() => {
    //     document.addEventListener("keydown", () => {
    //         if (inpFieldRef.current) {
    //           inpFieldRef.current.focus();
    //         }
    //       });
    // }, []);
    useEffect(() => {
        if(timeLeft===0){
            stopTimer();
        }
    }, [timeLeft]);
    
    
    // Get the top 3 players
    
const [filteredPlayers, setFilteredPlayers] = useState([]);
const [topPlayers, setTopPlayers] = useState([]);

useEffect(() => {
  const filtered = existingPlayers.filter(player => player.dif === difficulty);
  filtered.sort((a, b) => {
    // if accuracy values are equal, sort by wpm value (descending order)
    if (a.wpm > b.wpm) return -1;
    if (a.wpm < b.wpm) return 1;
    
    // sort by accuracy value (descending order)
    if (a.accuracy > b.accuracy) return -1;
    if (a.accuracy < b.accuracy) return 1;
    
    // if both accuracy and wpm values are equal, sort by name (ascending order)
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;

    // if all values are equal, don't change the order
    return 0;
  });
  setFilteredPlayers(filtered);
  setTopPlayers(filtered.slice(0, 3));
}, [existingPlayers, difficulty]);
  
    const stopTimer = () => {
        clearInterval(timer);
        setIsTyping(false);
        showMedal();
        setTestEnded(true); // set testEnded to true
        if (timeLeft < 0) {
            setTimeLeft(0);
          }
    };
    useEffect(() => {
        if (charIndex === characters.length) {
            clearInterval(timer);
            setInputValue("");
        }
    }, [charIndex, characters]);
    const startTimer = () => {
        setTimer(setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);
        }, 1000));
        setIsTyping(true);
    };
    const loadParagraph = () => {
        let chars = [];
        if(difficulty==="Easy"){
            const ranIndex = Math.floor(Math.random() * easyparagraphs.length);
            chars = easyparagraphs[ranIndex].split("").map((char) => ({
                value: char,
                status: "notTyped",
            }));
        }
        if(difficulty==="Moderate")
        {
            const ranIndex = Math.floor(Math.random() * medparagraphs.length);
            chars = medparagraphs[ranIndex].split("").map((char) => ({
                value: char,
                status: "notTyped",
            }));
        }
        if(difficulty==="Hard"){
            const ranIndex = Math.floor(Math.random() * hardParagraphs.length);
            chars = hardParagraphs[ranIndex].split("").map((char) => ({
                value: char,
                status: "notTyped",
            }));
        }
        setCharacters(chars);
        setCharIndex(0);
        chars[0].status = "active";
    };
    const initTyping = (event) => {
        const typedChar = event.target.value;
        const chars = [...characters];
        if (charIndex < chars.length && timeLeft > 0) {
            if (!isTyping) {
                setIsTyping(true);
                startTimer();
            }
            if (isTyping)
            {
                if (difficulty === "Hard" && event.keyCode === 8) {
                event.preventDefault();
                }
                else{
                    setCharacters(chars);
                    if (chars[charIndex-1].status === "incorrect") {
                        setTotalErrors((prevErrors) => prevErrors + 1);
                    }
                    setTotalChars((prevChars) => prevChars + 1);
                    const newAccuracy = ((totalChars - totalErrors) / totalChars) * 100;
                    setAccuracy(newAccuracy.toFixed(2)); // Round to 2 decimal places
                    if (typedChar === "") {
                        if (charIndex > 0) {
                            setCharIndex(charIndex - 1);
                            if (chars[charIndex - 1].status === "incorrect") {
                                setErrors(errors-1);
                            }
                            chars[charIndex - 1].status = "notTyped";
                        }
                    } else if (chars[charIndex].value === typedChar) {
                        chars[charIndex].status = "correct";
                        setCharIndex(charIndex + 1);
                        if (charIndex === chars.length - 1) {
                            stopTimer();
                        }
                    }
                }
            }
        } else {
            stopTimer();
        }
    };

    const resetTest = () => {
        stopTimer();
        setShowPopUp(false);
        setFailFlag(false);
        setTimeLeft(120);
        setCharIndex(0);
        setErrors(0);
        setIsTyping(false);
        setWpm(0);
        setCpm(0);
        setTestEnded(false);
        setNetWpm(0);
        setAccuracy(100);
        setTotalChars(0);
        setTotalErrors(0);
        setInputValue("");
        loadParagraph();
        inpFieldRef.current.value = "";
        inpFieldRef.current.focus();
        const inputField = inpFieldRef.current;
        inputField.setSelectionRange(0, 0); // set selection range to start at index 0  
    };
    const handleInputChange = e => {
        const typedChar = e.target.value.charAt(charIndex);
        setInputValue(e.target.value);

        if (charIndex >= characters.length - 1 || timeLeft <= 0) {
            stopTimer();
            return;
        }

        if (!isTyping) {
            startTimer();
        }

        if (!typedChar) {
            handleBackspace();
        } else {
            handleTypedChar(typedChar);
            updateStats();
        }
    };
    const updateStats = () => {
        const timeElapsed = 120 - timeLeft;
        const correctChars = characters.filter(char => char.status === "correct").length;
        setWpm(Math.floor((correctChars / 5) / (timeElapsed / 60)));
        setCpm(Math.floor(correctChars / (timeElapsed / 60)));
        setNetWpm(Math.round(Math.floor(wpm * (accuracy / 100)) - (2 * errors) / 5));
    };
    const handleBackspace = () => {
        if (charIndex > 0) {
            setCharIndex(prevIndex => prevIndex - 1);

            if (characters[charIndex-1].status === "incorrect") {
                setErrors(errors-1);
            }

            setCharacters(prevChars => {
                const newChars = [...prevChars];
                newChars[charIndex].status = "notTyped";
                newChars[charIndex-1].status = "active";
                return newChars;
            });
        } else {
            return; // do nothing if backspace is pressed at the first character
        }
    };

    const handleTypedChar = typedChar => {
        setCharacters(prevChars => {
            const newChars = [...prevChars];

            if (newChars[charIndex].value === typedChar) {
                newChars[charIndex].status = "correct";
            } else {
                newChars[charIndex].status = "incorrect";
                setErrors(errors+1);
            }
            newChars[charIndex+1].status = "active";
            return newChars;
        });

        setCharIndex(prevIndex => prevIndex + 1);
    };
    const newGame = (event) => {
        root.render(<App />); // opens another game
        event.currentTarget.style.display = 'none';
    };
    const trainer = (event) => {
        root.render(<App2 />); // opens another game
        event.currentTarget.style.display = 'none';
    };
    const Mtarget = event => {
        root.render(<App3 />);
        event.currentTarget.style.display = 'none';
    };
    const showMedal = () => {
        if(wpm < 25 || accuracy < 60) {
            setMedalImage(fail);
            SetMedalName("We'll get'em next time");
            SetCongratsText("MISSION FAILED");
            setFailFlag(true);
            setShowPopUp(true);
        }
        else
        {
            setMedalImage(fail);
            SetMedalName("Times UP!!!")
            SetCongratsText("-Too slow-");
            setFailFlag(true);
            setShowPopUp(true);
        }
        if ((wpm >= 25 && wpm < 30) && accuracy >= 60) {
            // Bronze Medal
            setFailFlag(false);
            setMedalImage(bronze);
            SetCongratsText("Nice...Keep It Up");
            SetMedalName("You won a Bronze Medal");
            setShowPopUp(true);
        } else if ((wpm >= 30 && wpm < 40) && accuracy >= 80  ) {
            // Silver Medal
            setFailFlag(false);
            setMedalImage(silver);
            SetCongratsText("Good Work");
            SetMedalName("You won a Silver Medal");
            setShowPopUp(true);
        } else if ((wpm >= 40 && wpm < 46) && accuracy >= 80 ) {
            // Gold Medal
            setFailFlag(false);
            setMedalImage(gold);
            SetCongratsText("Impressive");
            SetMedalName("You won a Gold Medal");
            setShowPopUp(true);
        } 
        
        if ((wpm >= 36 && wpm < 41) && accuracy >= 90) {
            // Platinum Medal
            setFailFlag(false);
            setMedalImage(platinum);
            SetCongratsText("Congratulations");
            SetMedalName("You won a Platinum Medal");
            setShowPopUp(true);
        } else if ((wpm >= 41 && wpm < 50) && accuracy >= 91) {
            // Diamond Medal
            setFailFlag(false);
            setMedalImage(diamond);
            SetCongratsText("Awesome Job");
            SetMedalName("You won a Diamond Medal");
            setShowPopUp(true);
        } else if (wpm >= 50 && accuracy > 92) {
            // Ace Medal
            setFailFlag(false);
            setMedalImage(ace);
            SetCongratsText("You're The Champion");
            SetMedalName("You won a ACE Medal");
            setShowPopUp(true);
        }
        
        
    };
    const closePopup = () => {
        if (failFlag===true)
        {
            setShowPopUp(false);
        }else{
            const name = nameInputRef.current.value.trim().toUpperCase();
            if (name.length === 0) {
                alert("Name cannot be empty!");
            } else if (name.length > 20) {
                alert("Name should not exceed 20 characters!");
            } else if (/^\d+$/.test(name)) {
                alert("Name should not contain numeric characters!");
            } else if (/[^a-zA-Z0-9]/.test(name)) {
                alert("Name should not contain special characters!");
            } else {
                setPlayerName(name);
                const playerData = {
                name : name,
                wpm : wpm,
                netSpeed : netwpm,
                accuracy : accuracy,
                medal : medalName,
                dif: difficulty,
                image: medalImage,
                };
                const data = localStorage.getItem('players');
                if (data) {
                    setExistingPlayers(JSON.parse(data));
                }
                const updatedPlayers = [...existingPlayers, playerData];
                setExistingPlayers([...existingPlayers, playerData]);
                localStorage.setItem('players', JSON.stringify(updatedPlayers));
                setShowPopUp(false);
            }
        }
    };
    const easyDif = () => {
        setDifficulty("Easy");
        resetTest();
        setShowDifPopUp(false);
    };
    const medDif = () => {
        setDifficulty("Moderate");
        resetTest();
        setShowDifPopUp(false);
    };
    const hardDif = () => {
        setDifficulty("Hard");
        resetTest();
        setShowDifPopUp(false);
    };
    const changeDifficulty = () => {
        setShowDifPopUp(true);
    };
    
    const openLeaderBoard = () => {
      if(leadopenFlag===false)
      {
        setLeadOpen(true);
      }   
      else{
        setLeadOpen(false);
      }
    };
    return (
        <div className="App">
            <header className="App-header">
                <div className="Top-Bar">
                    <span style={{display:'inline-flex'}}>
                        <button className="dropbtn game2" onClick={toggleDropdown}>Games</button>
                        <button className="game2" onClick={openLeaderBoard}>Leaderboard</button>
                    </span>
                        {dropdownOpen && (
                            <div className="dropdown-content">
                                <button type="button" className="game2" onClick={newGame}>Precision</button>
                                <button type="button" className="game2" onClick={trainer}>Aim✜Trainer</button>
                                <button type="button" className="game2" onClick={Mtarget}>RefleX</button>
                            </div>
                        )}
                </div>

                {leadopenFlag && (
                <div id="rgb">
                        <div id="popup">
                            <div className="topLeadersList">
                                {filteredPlayers.map((leader, index) => (
                                <div className="leader" key={index}>
                                    {topPlayers.includes(leader) && (
                                    <div className="containerImage">
                                        <img className="image" loading="lazy" src={leader.image} />
                                        <div className="crown">
                                        <svg
                                            id="crown1"
                                            fill="#0f74b5"
                                            data-name="Layer 1"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 100 50"
                                        >
                                            <polygon
                                            className="cls-1"
                                            points="12.7 50 87.5 50 100 0 75 25 50 0 25.6 25 0 0 12.7 50"
                                            />
                                        </svg>
                                        </div>
                                        <div className="leaderName">{leader.name}</div>
                                    </div>
                                    )}
                                </div>
                                ))}
                            </div>
                            <div className="playerslist">
                                <div className="table">
                                    <div>#</div>
                                
                                    <div>Name</div>
                                
                                
                                    <div>WPM</div>
                                
                                    <div>Net Speed</div>
                                
                                    <div>
                                    Accuracy
                                    </div>
                                
                                    <div>
                                    Medal
                                    </div>
                                </div>
                                <div className="list">
                                {filteredPlayers.map((leader, index) => (
                                    <div className="player" key={index}>
                                    <span style={{fontSize:'1.8vh'}}> {index + 1}</span>
                                    <div className="user">
                                        <img className="image" src={leader.image} />
                                        <span> {leader.name} </span>
                                    </div>
                                    <span> {leader.wpm} </span>
                                    <span> {leader.netSpeed} </span>
                                    <span> {leader.accuracy} </span>
                                    <span> {leader.medal} </span>
                                    </div>
                                ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {showDifpopup && 
                (<div id="rgb">
                    <div id="popup">
                        <h2>Select Difficulty</h2>
                        <div id="difButtonContainer">
                            <span id="difbtnSpace">
                                <button className="difButton" onClick={easyDif}>👶Easy</button>
                                <button className="difButton" onClick={medDif}>👦Moderate</button>
                                <button className="difButton" onClick={hardDif}>👨‍💻Hard</button>
                            </span>
                        </div>
                    </div>
                </div>)}
                {showpopup && 
                (<div id="rgb">
                    <div id="popup">
                        <h2>{congratsText}!</h2>
                        <p>{medalName}.</p>
                        <img src={medalImage} alt="medal" /><br />
                        <p>Speed:{wpm}wpm | Net Speed:{netwpm}wpm | Accuracy:{accuracy}%</p>
                        {console.log(failFlag)}
                        {failFlag ? <button onClick={resetTest}>Try Again</button> :
                        <span id='difbtnSpace'>
                            <input type="text" id="txtname" onKeyDown={() => nameInputRef.current.focus()} placeholder="Enter Your Name" ref={nameInputRef} />
                            <button onClick={closePopup}>OK</button>
                        </span>
                        }
                    </div>
                </div>
                )}
                <div className="wrapper">
                    <div className="typing-text">
                        <p>
                            {characters.map((char, index) => (
                                <span
                                    key={index}
                                    className={char.status}
                                    onClick={() => inpFieldRef.current.focus()}
                                >
                                    {char.value}
                                </span>
                            ))}
                        </p>
                    </div>
                    <div className="content">
                            <input
                                className="input-field"
                                type="text"
                                value={inputValue}
                                onChange={(e) => {
                                    handleInputChange(e);
                                }}
                                onKeyDown={(e) => {
                                    initTyping(e);
                                }}
                                ref={inpFieldRef}
                                disabled={testEnded ? true : ""}
                        />
                    </div><hr />
                    <table className="stats" border="1px">
                        <thead>
                            <tr>
                                <th>
                                    <div className="timeLeft">
                                        Time left: <span><b>{
                                        `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`
                                        }s</b></span>
                                    </div>
                                </th>
                                <th>
                                    <div className="errors">
                                        Errors: <span>{errors}</span>
                                    </div>
                                </th>
                                <th>
                                    <div className="wpm">
                                        WPM: <span>{wpm>1000 ? 0 : wpm}</span>
                                    </div>
                                </th>
                                <th>
                                    <div className="cpm">
                                        CPM: <span>{cpm>1000 ? 0 : cpm}</span>
                                    </div>
                                </th>
                                <th>
                                    <div className="cpm">
                                        Net Speed: <span>{netwpm>1000 || netwpm < 0 ? 0 : netwpm}wpm</span>
                                    </div>
                                </th>
                                <th>
                                    <div className="cpm">
                                        Accuracy: <span>{accuracy}%</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                    </table>
                    <br />
                    <span id="difbtnSpace">
                        <button onClick={resetTest}>{isTyping ? "Reset" : "Try Again"}</button>
                        <button onClick={changeDifficulty}>Change Difficulty</button>
                    </span>
                </div>
            </header>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
export default App;