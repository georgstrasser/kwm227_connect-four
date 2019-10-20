// KWM227 - HUE03 - 07.06.2018
// Georg Strasser - S1610456033
// js/model.js

lib = window.lib || {};

(function () {

    class Model {
        constructor(){
            this._player1 = "x";
            this._player2 = "o";
            this._cols = 7;
            this._rows = 6;
            this._toWin = 4;
            this.initialise();
        }

        /**
         * Getters and setters for all attributes
         */
        get player1(){
            return this._player1;
        }
        set player1(token){
            this._player1 = token;
        }
        get player2(){
            return this._player2;
        }
        set player2(token){
            this._player2 = token;
        }
        get rows(){
            return this._rows;
        }
        set rows(numRows){
            this._rows = numRows;
        }
        get cols(){
            return this._cols;
        }
        set cols(numCols){
            this._cols = numCols;
        }
        get toWin(){
            return this._toWin;
        }
        set toWin(tokens){
            this._toWin = tokens;
        }
        get field(){
            return this._field;
        }
        set field(field){
            this._field = field;
        }
        get freeLots(){
            return this._freeLots;
        }
        set freeLots(lots){
            this._freeLots = lots;
        }
        get currentPlayer(){
            return this._currentPlayer;
        }
        set currentPlayer(player){
            this._currentPlayer = player;
        }
        get winner(){
            return this._winner;
        }
        set winner(winner){
            this._winner = winner;
        }
        get winningStreak(){
            return this._winningStreak;
        }
        set winningStreak(streak){
            this._winningStreak = streak;
        }

        /**
         * Initialises the playing field and sets/resets
         * attributes in order to start a new game.
         * @this.field -> The array for the playing field.
         *             -> Index of the far left col = 0
         *             -> Index of the top row = 0
         * @this.freeLots -> Number of free lots in the playing field
         * @this.currentPlayer -> Refers to the current player
         *                     -> Player 1 always starts in a match
         * @this.winner -> Refers to the player who won the match
         *              -> Is 'false' as long as no one has one
         *              -> Is 'true' if no player won the match
         */
        initialise(){
            //Reduces number of cols to 9 if necessary,
            //to avoid lack of input keys
            if(this.cols > 9) this.cols = 9;
            //Initialising Array for playing field
            this.field = [];
            for (let i=0 ; i<this.rows; i++) {
                this.field[i] = [];
                for (let j=0; j<this.cols; j++) {
                    this.field[i][j] = "-";
                }
            }
            //Set further attributes
            this.freeLots = this.rows*this.cols;
            this.currentPlayer = this.player1;
            this.winningStreak = null;
            this.winner = false;
        }

        /**
         * Switches the currentPlayer from one player to the other
         */
        switchPlayers(){
            if(this.currentPlayer == this.player1){
                this.currentPlayer = this.player2;
            }
            else this.currentPlayer = this.player1;
        }

        /**
         * Inserts a token to the bottom of a column (hightes possible index) if
         * possible and reduces the number of free lots in the playing field. Calls
         * 'checkFinished' to check if a player has won the game and calls the
         * function to finish the game if necessary. Calls function to switch players.
         * @param columnIndex: Index of the column in the playing field,
         *                     in which the token should be inserted.
         */
        insertTokenAt(columnIndex){
            if(this.isInsertTokenPossibleAt(columnIndex)){
                let row = this.rows-this.getNumOfTokensInCol(columnIndex)-1;
                this.field[row][columnIndex] = this.currentPlayer;
                this.freeLots--;
                let streak = this.checkFinished(row, columnIndex, this.currentPlayer);
                if(streak != null) this.finishGame(streak);
                else this.switchPlayers();
                return true;
            }
            return false;
        }

        /**
         * Checks, if it is possible to insert a token into the given column
         * @param columnIndex: Index of the column in the playing field,
         *                     in which the token should be inserted.
         * @returns {boolean}: 'true' if possible, 'false' if not.
         */
        isInsertTokenPossibleAt(columnIndex){
            return this.field[0][columnIndex] == "-";
        }

        /**
         * Returns the number of already played tokens in a given column
         * @param columnIndex: Index of the column in the playing field,
         *                     in which the tokens should be countend.
         * @returns {number}: Number of tokens in the column
         */
        getNumOfTokensInCol(columnIndex){
            let numTokens = 0;
            for(let i=this.rows-1; i>=0; i--){
                if(this.field[i][columnIndex] !== "-"){
                    numTokens++;
                }
                else return numTokens;
            }
            return numTokens;
        }

        /**
         * Checks, if the current player has reached the necessary streak to win
         * the game by inserting the current token.
         * @param row: Row index of the currently inserted token
         * @param col: Column index of the currently inserted token
         * @param player: Token of the current player
         * @returns: 'winningStreak' -> The array of the position coordinates of the
         *                           -> game-winning tokens, if the streak has been reached.
         *           'false' -> If there are no more free lots in the playing field.
         *           'null' -> If the streak has not been reached and there are still
         *                     free lots in the playing field.
         */
        checkFinished(row, col, player){
            let winningStreak = [];

            //Checking for a streak vertically in the column of the inserted token
            let streak = [];
            let streakReached = false;
            for(let i=0; i<this.rows; i++){
                if(this.field[i][col] == player){
                    streak.push([i,col]);
                    if(streak.length == this.toWin){
                        streakReached = true;
                        i=this.rows;
                    }
                }
                else streak = [];
            }
            if(streakReached) winningStreak = winningStreak.concat(streak);

            //Checking for a streak horizontally in the row of the inserted token
            streakReached = false;
            streak = [];
            for(let i=0; i<this.cols; i++){
                if(this.field[row][i] == player){
                    streak.push([row,i]);
                    if(streak.length == this.toWin) streakReached = true;
                }
                else{
                    if(!streakReached) streak = [];
                    else i=this.cols;
                }
            }
            if(streakReached) winningStreak = winningStreak.concat(streak);

            //Checking for a streak diagonally from top left to bottom right in the
            //line of the inserted token and adding it to the winningStreak Array.
            let spots;
            if(this.rows >= this.cols) spots = this.rows;
            else spots = this.cols;
            winningStreak = winningStreak.concat(this.checkDiagonally(row,col,player,spots,1));

            //Checking for a streak diagonally from bottom left to top right in the
            //line of the inserted token and adding it to the winningStreak Array.
            winningStreak = winningStreak.concat(this.checkDiagonally(row,col,player,spots,-1));

            if(winningStreak.length >= this.toWin) return winningStreak;
            else if(this.freeLots == 0) return false;
            return null;
        }

        /**
         * Checks for a diagonal streak in the line of the inserted token.
         * @param row: Row index of the currently inserted token
         * @param col: Column index of the currently inserted token
         * @param player: Token of the current player
         * @param spots: Half the number of spots that should be checked for a streak.
         *               The method will go check through spots*(-1) to spots
         * @param mp: Multiplier, -1 to search from bottom left to top right
         *                        +1 to search from bottom right to top left
         * @returns {Array}: If a streak big enough to win the game has been reached,
         *                   an array with the coordinates of the game-winning tokens
         *                   will be returned. If the streak has not been reached,
         *                   an empty array will be returned.
         */
        checkDiagonally(row,col,player,spots,mp){
            let streakReached = false;
            let streak = [];
            for(let i=spots*(-1); i<spots; i++){
                if(row+(i*mp) >= 0 && row+(i*mp) < this.rows && col+i >= 0 && col+i < this.cols){
                    if(this.field[row+(i*mp)][col+i] == player){
                        streak.push([row+(i*mp),col+i]);
                        if(streak.length == this.toWin) streakReached = true;
                    }
                    else{
                        if(!streakReached) streak = [];
                        else return streak;
                    }
                }
            }
            if(streakReached) return streak;
            else return [];
        }

        /**
         * Transforms the tokens of the winning streak to uppercase in the field array
         * and sets the winner to the current player if a player has won. If no player
         * has won the winner will be set to 'true' for the program to notify that the
         * game is over. Triggers the 'finish' function to update the View-class.
         * @param streak: Array of the coordinates of the winning-streak-tokens.
         *                'false' if no player has won the game
         */
        finishGame(streak){
            let winner = this.currentPlayer;
            if(streak){
                for(let i=0; i<streak.length; i++){
                    this.field[streak[i][0]][streak[i][1]] = "<span class='winner'>"+winner.toUpperCase()+"</span>";
                }
                this.winningStreak = streak;
            }
            else winner = true;
            this.winner = winner;
            $(this).trigger('finish');
        }

        /**
         * Transforms the complete status of the game to string, describing
         * information about the current player, status of the game
         * (next turn, game over and reason for game over), the whole
         * playing field and location of all placed tokens in a game.
         * @returns string of information about the game, fully wrapped in
         *          HTML-tags, ready to be inserted into the DOM.
         */
        toString(){
            let string = "<h3>";
            if(this.winner == this.player1 || this.winner == this.player2){
                string += "GAME OVER: We have a winner!";
            }
            else if(this.freeLots == 0){
                string += "GAME OVER: No more turns available!";
            }
            else{
                if(this.currentPlayer == "x") string += "Player 1";
                else string += "Player 2";
                string += ", take your turn!";
            }
            string += "</h3>";
            for (let i=0; i<this.rows; i++) {
                string += "<div class='row'>";
                for(let j=0; j<this.field[i].length; j++){
                    string += "<div class='field' id='f"+i+j+"'>";
                    string += this.field[i][j];
                    string += "</div>";
                }
                string += "</div>";
            }
            return string;
        }

    }

    lib.Model = Model;

}());