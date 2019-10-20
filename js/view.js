// KWM227 - HUE03 - 07.06.2018
// Georg Strasser - S1610456033
// js/view.js

lib = window.lib || {};

(function () {

    class View {
        constructor(model, $field, $staticMsg, $dynamicMsg){
            this.model = model;
            this._ballSize = 50;
            this._margin = 40;
            this._$field = $field; //Playing field, updated during the game
            this._$staticMsg = $staticMsg; //Basic game info, not updated during game
            this._$dynamicMsg = $dynamicMsg; //Game info, updated during game
            this._initiate();
            $(model).on('finish', this._finish.bind(this));
        }

        /**
         * Starts the match by creating the interface texts, drawing the playing field,
         * adapting the sizes and margins to the according attributes and adding the
         * event handlers.
         * @private
         */
        _initiate(){
            //Creating the static instructions and adding them to the DOM
            this._$staticMsg.append(
                "You need a streak of "+this.model.toWin+" tokens to win.<br/>"+
                "Click the column or press the keys 1 to "+this.model.cols+" insert a token into the according column!<br/>"+
                "Press 'r' to restart at any time.<br/></p>"+
                "<button class='restartBtn'>Restart</button>"
            );
            //Creating the initial dynamic message
            this._$dynamicMsg.append("<h3><span class='x'>Player 1</span>, take your turn!</h3>");

            //Disabling all previous event handlers
            $('.open').off('mouseup');
            $('body').off('keypress');
            $('.restartBtn').off('click');

            //Drawing the playing field
            for(let i=0; i<this.model.cols; i++){
                let $col = $("<div class='col open col-"+i+"'></div>");
                $col.css('left', i*this._ballSize+"px");
                $col.css('top', (-1)*this._ballSize+"px");
                for(let j=this.model.rows-1; j>=0; j--){
                    let $spot = $("<div class='ball spot'></div>");
                    $spot.css('top', (j+1)*this._ballSize+"px");
                    $col.append($spot);
                }
                this._$field.append($col);
            }

            //Adapting the sizes of the display to the given attributes
            $(".messages").css('margin-left', this._margin+"px");
            this._$field.css('margin', this._margin+"px");
            this._$field.css('margin-top', (this._margin+this._ballSize)+"px");
            this._$field.css('width', this._ballSize*this.model.cols+"px");
            this._$field.css('height', this._ballSize*this.model.rows+"px");
            $('.col').css('width', this._ballSize+"px");
            $('.col').css('height', this._ballSize*(this.model.rows+1)+"px");
            $('.ball').css('width', this._ballSize+"px");
            $('.ball').css('height', this._ballSize+"px");
            $('.restartBtn').css('width', this._ballSize*(this.model.rows+1)+"px");

            //Adding the event handler
            this._addEventHandler(this);
        }

        /**
         * Finishes the game by highlighting the winning tokens
         * @private
         */
        _finish(){
            $('.placeholder').remove();
            if(this.model.winningStreak != null) {
                let winningStreak = this.model.winningStreak;
                setTimeout(function() {
                    for (let i=0; i<winningStreak.length; i++) {
                        $(".token_" + winningStreak[i][0] + "-" + winningStreak[i][1]).addClass('winningToken');
                    }
                }, 500);
            }
            $('.open').off('mouseenter');
            $(".open").removeClass('open');
        }

        /**
         * Calls functions to restart the game
         * @private
         */
        _restart(){
            this._$staticMsg.empty();
            this.model.initialise();
            this._$field.empty();
            this._$dynamicMsg.empty();
            this._initiate();
        }

        /**
         * Inserts a token into a giving column. Adapts the column if the column is now full.
         * @param colIndex: Index of the column that the token should be inserted in
         * @private
         */
        _insertToken(colIndex){
            let rowIndex = this.model.getNumOfTokensInCol(colIndex);
            let player = this.model.currentPlayer;
            if(this.model.insertTokenAt(colIndex)){
                this._createDynamicMessage();
                this._createToken(colIndex, rowIndex, player);
                if(rowIndex+1 == this.model.rows){
                    $(".col-"+colIndex).removeClass('open');
                    $(".col-"+colIndex).off('mouseenter');
                    $(".placeholder").remove();
                }
            }
        }

        /**
         * Creates a new Ball element and 'throws' it in the playing field
         * @param colIndex: Column of the token
         * @param rowIndex: Row of the token
         * @param player: Player the token belongs to
         * @private
         */
        _createToken(colIndex, rowIndex, player){
            new lib.Ball((colIndex*this._ballSize)+this._margin,
                -this._ballSize, (this.model.rows-rowIndex-1)*this._ballSize, player,
                this._margin, "token_"+(this.model.rows-rowIndex-1)+"-"+colIndex, this._ballSize);
        }

        /**
         * Creates the dynamic game status that is displayed after every move.
         * Gives information on whose turn it is, if the game is finished or
         * who won.
         * @private
         */
        _createDynamicMessage(){
            this._$dynamicMsg.empty();

            let currentPlayer;
            if(this.model.currentPlayer == "x") currentPlayer = "<span class='x'>Player 1</span>";
            else currentPlayer = "<span class='o'>Player 2</span>";
            let string = "<h3>";

            if(this.model.winner == this.model.player1 || this.model.winner == this.model.player2){
                string += ("GAME OVER: "+currentPlayer+" wins!");
            }
            else if(this.model.freeLots == 0){
                string += "GAME OVER: No more turns available!";
            }
            else{
                string += (currentPlayer+", take your turn!");
            }
            string += "</h3>";
            this._$dynamicMsg.append(string);
        }

        /**
         * Adds the click handler on the placeholder token on top of the hovered row
         * @param $element: Element, the click handler is referred to
         * @param that: this object
         * @param colIndex: Column index of the element
         * @private
         */
        _addClickHandler($element, that, colIndex){
            $element.on('mouseup', function(e){
                if(!that.model.winner){
                    that._insertToken(parseInt(colIndex));
                    $(this).remove();
                }
            })
        }

        /**
         * Adds event handlers to the application
         * @param that: this object
         * @private
         */
        _addEventHandler(that){
            //If an column, that has still free spaces is hovered over,
            //a placeholder token will apear to be clicked at
            $('.open').on('mouseenter', function(e){
                let colIndex = $(e.currentTarget).attr('class');
                colIndex = colIndex.charAt(colIndex.length-1);
                //Creating the placeholder token
                let $placeholder = $("<div class='ball placeholder "+that.model.currentPlayer+"Player'></div>");
                $placeholder.css('width', that._ballSize);
                $placeholder.css('height', that._ballSize);
                //Adding the click handler to the placeholder token
                that._addClickHandler($placeholder, that, colIndex);
                //Adding the placeholder to 'this' column
                $(this).append($placeholder);
            });

            //Removes placeholder tokens if the mouse leaves to column
            $('.open').on('mouseleave', function(e){
                $('.placeholder').remove();
            });

            //Restarts the game by clicking the "Restart"-button.
            //If the game is not finished, the user will be asked a confirm question.
            $('.restartBtn').on('click', function(e){
                if(that.model.winner || confirm("The game is not yet finished! Do you really want to restart?")){
                    that._restart();
                }
            });

            //The user can press the numbers 1-9 (keycode 49-57) in order to try
            //to insert a token during a game. The game can be restarted at any
            //time by pressing 'r' and confirming the restart. If the game is over
            //it can be restarted by pressing either 'r' (keycode 114) or 'ENTER'
            //(keycode 13) without having to confirm it.
            $("body").on('keypress', function(e) {
                let keycode = e.keyCode;
                if(keycode >= 49 && keycode <= 49+that.model.cols && !that.model.winner){
                    that._insertToken(keycode-49);
                }
                if(keycode == 13 && that.model.winner){
                    that._restart();
                }
                if(keycode == 114){
                    if(that.model.winner || confirm("The game is not yet finished! Do you really want to restart?")){
                        that._restart();
                    }
                }
            });
        }

    }

    lib.View = View;

}());