(function () {
    function SnakeGame() {
        // Singleton
        if (SnakeGame.instance) {
            return SnakeGame.instance;
        }
        SnakeGame.instance = this;

        this.tableEl = document.getElementsByTagName('table')[0];
        this.grid = [];
        this.curDir = 0;
        this.ticker = null;
        this.playing = false;
        this.crashed = false;
        this.tickDirSet = false;

        this.snake = [];

        this.init();
    }
    window['SnakeGame'] = SnakeGame;

    SnakeGame.config = {
        GRID_SIZE_X: 20,
        GRID_SIZE_Y: 20,
        GAME_TICK_MS: 500,
        APPLE_INTERVAL_MS: 5000,
    };

    SnakeGame.keyCodes = {
        UP: [38, 87],
        DOWN: [40, 83],
        LEFT: [37, 65],
        RIGHT: [39, 68],
        START: [13],
    };

    SnakeGame.events = {
        KEYDOWN: 'keydown',
    };

    SnakeGame.dirs = { // Pseudo enum
        'UP': 0,
        'DOWN': 1,
        'LEFT': 2,
        'RIGHT': 3,
        0: 'UP',
        1: 'DOWN',
        2: 'LEFT',
        3: 'RIGHT',
    };

    SnakeGame.prototype = {
        setupGrid() {
            for (let i = SnakeGame.config.GRID_SIZE_X; i > 0; i--) {
                const rowElem = document.createElement('tr');
                for (let j = SnakeGame.config.GRID_SIZE_Y; j > 0; j--) {
                    const cellElem = document.createElement('td');
                    rowElem.appendChild(cellElem);
                    
                    if (!this.grid[i - 1]) {
                        this.grid[i - 1] = [cellElem];
                    } else {
                        this.grid[i - 1].push(cellElem);
                    }
                }

                this.tableEl.appendChild(rowElem);
            }
        },
        setupSnake() {
            this.snake.push({
                x: parseInt(SnakeGame.config.GRID_SIZE_X / 2),
                y: parseInt(SnakeGame.config.GRID_SIZE_Y / 2),
            });
        },
        setupTicker() {
            this.ticker = setInterval(() => this.update(), SnakeGame.config.GAME_TICK_MS);
        },
        setupAppleSpawner() {
            setInterval(() => this.spawnApple(), SnakeGame.config.APPLE_INTERVAL_MS);
        },
        handleEvent() {
            document.addEventListener(SnakeGame.events.KEYDOWN, (e) => this.onKeyDown(e));
        },
        onKeyDown(e) {
            if (!this.playing) {
                // Start
                if (SnakeGame.keyCodes.START.indexOf(e.keyCode) > -1) {
                    if (this.crashed) {
                        this.restart();
                    }
                    
                    this.playing = true;
                }
            } else {
                // Dirs change
                if (!this.tickDirSet) {
                    if (SnakeGame.keyCodes.UP.indexOf(e.keyCode) > -1) {
                        if (this.curDir === SnakeGame.dirs.DOWN) {
                            return;
                        }

                        this.curDir = SnakeGame.dirs.UP;
                        this.tickDirSet = true;
                    }
                    
                    if (SnakeGame.keyCodes.DOWN.indexOf(e.keyCode) > -1) {
                        if (this.curDir === SnakeGame.dirs.UP) {
                            return;
                        }

                        this.curDir = SnakeGame.dirs.DOWN;
                        this.tickDirSet = true;
                    }

                    if (SnakeGame.keyCodes.LEFT.indexOf(e.keyCode) > -1) {
                        if (this.curDir === SnakeGame.dirs.RIGHT) {
                            return;
                        }

                        this.curDir = SnakeGame.dirs.LEFT;
                        this.tickDirSet = true;
                    }

                    if (SnakeGame.keyCodes.RIGHT.indexOf(e.keyCode) > -1) {
                        if (this.curDir === SnakeGame.dirs.LEFT) {
                            return;
                        }

                        this.curDir = SnakeGame.dirs.RIGHT;
                        this.tickDirSet = true;
                    }
                }
            }
        },
        clearSnakeFromGrid() {
            for (const row of this.grid) {
                for (const cell of row) {
                    if (cell.className === 'snake') {
                        cell.className = '';
                    }
                }
            }
        },
        genRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        spawnApple() {
            let appleSpawned = false;
            while (!appleSpawned) {
                const randomX = this.genRandomInt(0, this.grid.length - 1);
                const randomY = this.genRandomInt(0, this.grid[randomX].length - 1);
                if (!this.grid[randomX][randomY].className) {
                    this.grid[randomX][randomY].className = 'apple';
                    appleSpawned = true;
                }
            }
        },
        update() {
            if (this.playing) {
                this.clearSnakeFromGrid();

                // Delete last block
                if (this.snake.length > 1) {
                    this.snake.splice(0, 1);
                }

                // Add head block
                let headBlock = this.snake[this.snake.length - 1];
                if (this.curDir === SnakeGame.dirs.UP) {
                    this.snake.push({
                        x: headBlock.x,
                        y: headBlock.y + 1,
                    });
                }
                if (this.curDir === SnakeGame.dirs.DOWN) {
                    this.snake.push({
                        x: headBlock.x,
                        y: headBlock.y - 1,
                    });
                }
                if (this.curDir === SnakeGame.dirs.LEFT) {
                    this.snake.push({
                        x: headBlock.x - 1,
                        y: headBlock.y,
                    });
                }
                if (this.curDir === SnakeGame.dirs.RIGHT) {
                    this.snake.push({
                        x: headBlock.x + 1,
                        y: headBlock.y,
                    });
                }

                // Draw snake
                for (const block of this.snake) {
                    // Check game over
                    if (
                        (!this.grid[block.y] || !this.grid[block.y][block.x]) || // Border
                        (this.grid[block.y][block.x].className === 'snake') // Self
                    ) {
                        alert('Game over');
                        this.clearSnakeFromGrid();
                        this.playing = false;
                        this.crashed = true;
                        return;
                    }

                    this.grid[block.y][block.x].className = 'snake';
                }

                this.tickDirSet = false;
            }
        },
        restart() {
            this.crashed = false;
            this.snake = [];
            this.setupSnake();
        },
        init() {
            this.setupGrid();
            this.setupSnake();
            this.setupTicker();
            this.setupAppleSpawner();
            this.handleEvent();
        },
    };

    document.addEventListener('DOMContentLoaded', function onDocumentLoad() {
        new SnakeGame();
    });
})();