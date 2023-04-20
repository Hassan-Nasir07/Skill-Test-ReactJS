import React from 'react';
import Cookies from 'js-cookie';
function highscore() {
    const highscore = Cookies.get('highscore');
    return (
        <div>
            <label style={{ fontSize: '15px', fontFamily: 'monospace', marginRight: '20px' }}>{highscore}</label>
        </div>
    );
}

export default highscore;