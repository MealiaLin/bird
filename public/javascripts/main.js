var bootState = {
    preload:function () {
        game.load.image('loading','/images/flappybird/loading0.gif'); //加载进度条图片资源
    },
    create: function () {
        game.state.start('preload'); //加载完成后，调用preload场景
    }
};

var preloadState = {
    preload : function(){
        var preloadSprite = game.add.sprite(0,0,'loading'); //创建显示loading进度的sprite
        game.load.setPreloadSprite(preloadSprite);  //用setPreloadSprite方法来实现动态进度条的效果

        //以下为要加载的资源
        //以下为要加载的资源
        game.load.image('background','/images/flappybird/bg_day.png'); //游戏背景图
        game.load.image('ground','/images/flappybird/land.png'); //地面
        game.load.image('title','/images/flappybird/title.png'); //游戏标题
        //game.load.spritesheet('bird','/images/flappybird/bird0_0.png'); //鸟
        game.load.image('bird', '/images/Flappy-bird.png');//小鸟
        game.load.image('btn','/images/flappybird/button_play.png');  //按钮
        //game.load.spritesheet('pipe','assets/pipes.png',54,320,2); //管道
        game.load.image('pipe', '/images/pipe.png');//管道
        //game.load.bitmapFont('flappy_font', 'assets/fonts/flappyfont/flappyfont.png', 'assets/fonts/flappyfont/flappyfont.fnt');//显示分数的字体
        //game.load.audio('fly_sound', 'assets/flap.wav');//飞翔的音效
        //game.load.audio('score_sound', 'assets/score.wav');//得分的音效
        game.load.audio('jump', '/images/jump.wav');
        //game.load.audio('hit_pipe_sound', 'assets/pipe-hit.wav'); //撞击管道的音效
        //game.load.audio('hit_ground_sound', 'assets/ouch.wav'); //撞击地面的音效


        game.load.image('ready_text','/images/flappybird/text_ready.png'); //get ready图片
        game.load.image('play_tip','/images/flappybird/tutorial.png'); //玩法提示图片
        game.load.image('game_over','/images/flappybird/text_game_over.png'); //gameover图片
        game.load.image('score_board','/images/flappybird/score_panel.png'); //得分板
    },
    create : function(){
        game.state.start('menu'); //当以上所有资源都加载完成后就可以进入menu游戏菜单场景了
    }
};


var menuState = {
    create:function () {
        game.add.tileSprite(0,0,game.width,game.height,'background').autoScroll(-10,0); //背景图
        game.add.tileSprite(0,game.height-80,game.width,112,'ground').autoScroll(-100,0); //地板
        var titleGroup = game.add.group(); //创建存放标题的组
        titleGroup.create(0,0,'title'); //标题
        var bird = titleGroup.create(190, 10, 'bird'); //添加bird到组里
        bird.animations.add('fly'); //添加动画
        bird.animations.play('fly',12,true); //播放动画
        titleGroup.x = 35;
        titleGroup.y = 100;
        game.add.tween(titleGroup).to({ y:120 },1000,null,true,0,Number.MAX_VALUE,true); //标题的补间动画,对这个组添加一个tween动画，让它不停的上下移动
        var btn = game.add.button(game.width/2,game.height/2,'btn',function(){//按钮
            game.state.start('main');
        });
        btn.anchor.setTo(0.5,0.5);
    }
};

// Create our 'main' state that will contain the game
var mainState = {
    create: function() {
        this.background = game.add.tileSprite(0,0,game.width,game.height, 'background');//背景图

        this.pipeGroup = game.add.group();//用于存放管道的组，后面会讲到
        this.pipeGroup.enableBody = true;

        this.ground = game.add.tileSprite(0,game.height-80,game.width,112,'ground'); //地板
        game.physics.enable(this.ground,Phaser.Physics.ARCADE);//开启地面的物理系统
        this.ground.body.immovable = true; //让地面在物理环境中固定不动

        this.bird = game.add.sprite(50,150,'bird'); //鸟
        game.physics.enable(this.bird,Phaser.Physics.ARCADE); //开启鸟的物理系统
        this.bird.body.gravity.y = 0; //鸟的重力,未开始游戏，先让重力为0，不然鸟会掉下来

        this.readyText = game.add.image(game.width/2, 40, 'ready_text'); //get ready 文字
        this.playTip = game.add.image(game.width/2,300,'play_tip'); //提示点击屏幕的图片
        this.readyText.anchor.setTo(0.5, 0);
        this.playTip.anchor.setTo(0.5, 0);
        //game.time.events.stop(false); //先不要启动时钟
        game.input.onDown.addOnce(this.startGame, this); //点击屏幕后正式开始游戏
    },

    startGame: function () {
        this.gameSpeed = 200; //游戏速度
        this.background.autoScroll(-(this.gameSpeed/10),0); //让背景开始移动
        this.ground.autoScroll(-this.gameSpeed,0); //让地面开始移动
        // 小鸟
        game.physics.arcade.enable(this.bird);
        this.bird.body.gravity.y = 1000;
        this.readyText.destroy(); //去除 'get ready' 图片
        this.playTip.destroy(); //去除 '玩法提示 图片
        var spaceKey = game.input.keyboard.addKey(
            Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);

        //管道
        this.pipes = game.add.group();
        //定时器，每1.5秒调用addRowOfPipes
        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);

        //得分：显示左上角的分数
        this.score = 0;
        this.labelScore = game.add.text(20, 20, "0",
            { font: "30px Arial", fill: "#ffffff" });

        // 改变小鸟旋转的中心点
        this.bird.anchor.setTo(-0.2, 0.5);

        //声音
        this.jumpSound = game.add.audio('jump');
    },

    /**
     * 最后update方法是更新函数，它会在游戏的每一帧都执行，以此来创造一个动态的游戏
     */
    update: function() {
        // 小鸟超过范围区域则重新开始游戏
        if (this.bird.y < 0 || this.bird.y > 490)
            this.restartGame();

        //小鸟慢慢向下旋转，直到某个点
        if (this.bird.angle < 20)
            this.bird.angle += 1;

        //当鸟死亡时，重新开始游戏
        //game.physics.arcade.overlap(this.bird, this.pipes, this.restartGame, null, this);
        //当鸟死亡时，从屏幕上掉下来
        game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this);
    },

    // Make the bird jump
    jump: function() {
        //在死亡时不能够让鸟跳跃
        if (this.bird.alive == false)
            return;
        // Add a vertical velocity to the bird
        this.bird.body.velocity.y = -350;

        //小鸟往上跳的时候，它向上旋转
        game.add.tween(this.bird).to({angle: -20}, 100).start();

        this.jumpSound.play();
    },

    // 重新开始游戏
    restartGame: function() {
        game.state.start('menu');
    },

    addOnePipe: function(x, y) {
        var pipe = game.add.sprite(x, y, 'pipe');
        this.pipes.add(pipe);
        game.physics.arcade.enable(pipe);
        pipe.body.velocity.x = -200;

        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },

    addRowOfPipes: function() {
        // Randomly pick a number between 1 and 5
        // This will be the hole position
        var hole = Math.floor(Math.random() * 5) + 1;

        // Add the 6 pipes
        // With one big hole at position 'hole' and 'hole + 1'
        for (var i = 0; i < 8; i++)
            if (i != hole && i != hole + 1)
                this.addOnePipe(285, i * 60 + 10);

        //每创建一个新管子就把分数加1
        this.score += 1;
        this.labelScore.text = this.score;
    },

    hitPipe: function() {
        // If the bird has already hit a pipe, do nothing
        // It means the bird is already falling off the screen
        if (this.bird.alive == false)
            return;

        // Set the alive property of the bird to false
        this.bird.alive = false;

        // Prevent new pipes from appearing
        game.time.events.remove(this.timer);

        // Go through all the pipes, and stop their movement
        this.pipes.forEach(function(p){
            p.body.velocity.x = 0;
        }, this);
    }
};

// Initialize Phaser, and create a 400px by 490px game
var game = new Phaser.Game(285, 490);

// Add the 'mainState' and call it 'main'
game.state.add('boot', bootState);
game.state.add('preload', preloadState);
game.state.add('menu', menuState);
game.state.add('main', mainState);

// Start the state to actually start the game
game.state.start('boot');