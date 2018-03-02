"use strict";

(function($) {

    var canvas_wrapper = $('#canvas'),

        canvas_star = document.getElementById('star'),
        ctx = canvas_star.getContext('2d'),

        canvas_linestar = document.getElementById('line-star'),
        ctx_l = canvas_linestar.getContext('2d'),

        w = canvas_star.width = canvas_linestar.width = window.innerWidth,
        h = canvas_star.height = canvas_linestar.height = window.innerHeight,

        image_bg = document.getElementById('image-bg'),
        image_bg_w = 4961,
        image_bg_h = 1559,

        // 星点色调
        hue = 217,
        // 星点实例数组
        stars = [],
        Meteors = [],
        // 星点生成数量
        sCount = 0,
        lCount = 0,
        // 星点最大数量
        maxStars = 3000,
        maxMeteors = 4;

    // 初始化外宽高
    canvas_wrapper.css({
        width: w,
        height: h
    });


    /**
     * ============================= canvas素材缓存 =============================
     */

    var cacheStar = getCanvas(100, 100, function(_cvs, _ctx){
        var _half = _cvs.width / 2,
            _gradient = _ctx.createRadialGradient(_half, _half, 0, _half, _half, _half);
        _gradient.addColorStop(0.025, 'rgba(255, 255, 255, 1)');
        _gradient.addColorStop(0.15, 'rgba(206, 213, 255, 0.9)');
        _gradient.addColorStop(0.20, 'rgba(222, 108, 255, 0.7)');
        _gradient.addColorStop(0.25, 'rgba(206, 213, 255, 0.1)');
        _gradient.addColorStop(1, 'transparent');

        _ctx.fillStyle = _gradient;
        _ctx.beginPath();
        _ctx.arc(_half, _half, _half, 0, Math.PI * 2);
        _ctx.fill();
    });

    var cacheMeteor = getCanvas(100, 100, function(_cvs, _ctx){
        var _half = _cvs.width / 2,
            _gradient = _ctx.createRadialGradient(_half, _half, 0, _half, _half, _half);
        _gradient.addColorStop(0.025, 'rgba(255, 255, 255, 1)');
        _gradient.addColorStop(0.25, 'rgba(85, 108, 255, 0.9)');
        _gradient.addColorStop(0.50, 'rgba(85, 108, 255, 0.1)');
        _gradient.addColorStop(1, 'transparent');

        _ctx.fillStyle = _gradient;
        _ctx.beginPath();
        _ctx.arc(_half, _half, _half, 0, Math.PI * 2);
        _ctx.fill();
    });


    var Star = function() {

        // 轨道原点
        this.orbitX = w / 2;
        this.orbitY = h / 2;
        // 轨道半径
        this.orbitRadius = random(0 , w * 1.5);

        // 初始旋转角
        this.timePassed = random(0 , maxStars);
        // 旋转速度（增长速度）
        // this.speed = random(this.orbitRadius) / 100000000000;

        // 视深半径
        this.radius = random(20, 40);
        // 透明度(影响闪烁)
        this.alpha = random(2, 10) / 10;

        this.sCount = sCount;

        sCount++;
        stars[sCount] = this;
    }

    Star.prototype.draw = function() {
        // 本次旋转位置（每次增加1°）
        var x = Math.sin(this.timePassed) * this.orbitRadius * 2 + this.orbitX,
            y = Math.cos(this.timePassed) * this.orbitRadius * 0.4 + this.orbitY,
            // 闪烁频率
            twinkle = random(20);

        if (twinkle === 1 && this.alpha > 0) {
            this.alpha -= 0.1;
        } else if (twinkle === 2 && this.alpha < 1) {
            this.alpha += 0.1;
        }

        //  限制显示区域(在同心圆1内,且不在偏心圆2内)
        if (inCircle(x, y, w/2, h*1.6, h*1.6*0.75) && !inCircle(x, y, w/2, h*2.6, h*2.6*0.75)) {
            // 变更透明度
            ctx.globalAlpha = this.alpha;
            // 绘制该星点
            ctx.drawImage(cacheStar, x - this.radius / 2, y - this.radius / 2, this.radius, this.radius);
        } else {
            // 变更透明度
            ctx.globalAlpha = this.alpha;

            if (ctx.globalAlpha > 0.95) {
                // 绘制该星点
                ctx.drawImage(cacheStar, x - this.radius / 2, y - this.radius / 2, 20, 20);            
            }
        }

        // 增加旋转角
        this.timePassed += 0; //this.speed;
    }

    var Meteor = function() {
        // 轨道原点
        this.orbitX = 0 - random(-2*w, w);
        this.orbitY = 0 - random(h / 2);
        // 透明度(影响闪烁)
        this.alpha = random(2, 10) / 2;
        this.init();
        lCount++;
        Meteors[lCount] = this;
    };

    Meteor.prototype.init = function() {
        // 更新原点
        this.orbitX = 0 - random(-w/2, w/2);
        this.orbitY = 0 - random(h / 2);

        // 半径
        this.radius = random(10, 80);
        // 旋转速度（增长速度）
        this.speed = random(4, Math.min(this.radius/2, 10) );
    };

    Meteor.prototype.draw = function() {
        // 本次旋转位置（每次增加1°）
        var x = this.orbitX = this.speed + this.orbitX,
            y = this.orbitY = this.speed + this.orbitY,
            // 闪烁频率
            twinkle = random(8);

        if (twinkle === 1 && this.alpha > 0) {
            this.alpha -= 0.05;
        } else if (twinkle === 2 && this.alpha < 1) {
            this.alpha += 0.05;
        }

        //  限制显示区域(在同心圆1内,且不在偏心圆2内)
        if (inRect (x, y)) {
            // 变更透明度
            ctx_l.globalAlpha = this.alpha;
            // 绘制该星点
            ctx_l.drawImage(cacheMeteor, x, y, this.radius, this.radius);
        } else if ( !inRect (x, y, -h, w, h ,-w) ) {
            this.init();
        }

    };

    /**
     * =============================== 初始化各种星星 ===============================
     */
    for (var i = 0; i < maxStars; i++) {new Star(); }
    for (var i = 0; i < maxMeteors; i++) {new Meteor(); }

    function animation() {
        // 在目标图像上显示源图像
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(0,0,0,1)';
        ctx.fillRect(0, 0, w, h);

        // 更新背景
        ctx.drawImage.apply(ctx, [image_bg].concat(getArg()));
        // 高光模式
        ctx.globalCompositeOperation = 'lighter';
        for (var i = 1, l = stars.length; i < l; i++) {
            stars[i].draw();
        }

        // 重绘
        ctx_l.globalCompositeOperation = 'source-over';
        ctx_l.globalAlpha = 0.15;
        ctx_l.drawImage(canvas_star, 0, 0);

        // 高光模式
        ctx_l.globalCompositeOperation = 'lighter';
        ctx_l.globalAlpha = 1;
        for (var i = 1, l = Meteors.length; i < l; i++) {
            Meteors[i].draw();
        }


        // ctx.beginPath();

        // ctx.strokeStyle="#0000ff";
        // ctx.arc(w/2, h*1.6, h*1.6*0.75,   0, 2*Math.PI);

        // ctx.strokeStyle="#ff00ff";
        // ctx.arc(w/2, h*2.6, h*2.6*0.75,  0, 2*Math.PI);

        // ctx.stroke();


        window.requestAnimationFrame(animation);
    }


    /**
     * ================================== 初始化及适配显示 ==================================
     */

    var _block = $('.block-png');
    if ( isMobile() || _block.height() / _block.width() > 1) {
        canvas_wrapper.addClass('show-on-mobile');
    }

    // 延迟到背景图加载完全再加载
    var _image = new Image();
    _image.onload = _image.onerror = function() {

        if (_image.height > 0) {

            image_bg_w = _image.width;
            image_bg_h = _image.height;

            setTimeout(function(){
                animation();
                _block.show();
            }, 0);
        }
    };
    _image.src = './images/image_bg.jpg?20170103';


    window.addEventListener('resize', function() {
        w = canvas_star.width = canvas_linestar.width = window.innerWidth;
        h = canvas_star.height = canvas_linestar.height = window.innerHeight;
        canvas_wrapper.css({
            width: w,
            height: h
        });

        // 窄屏适配
        if (h / w > 1) {
            canvas_wrapper.addClass('show-on-mobile');
        } else {
            canvas_wrapper.removeClass('show-on-mobile');
        }

    }, false);

    function random(min, max) {
        if (arguments.length < 2) {max = min; min = 0; }
        if (min > max) {var hold = max; max = min; min = hold;}
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // (x,y)在圆心(cx,cy)半径cr内
    function inCircle(x, y, cx, cy, cr) {
        // 如果不能转成数字类型，则失败
        if ( !(+x && +x+1) || !(+y && +y+1) ) return false;
        // 初始化圆心和半径
        cx = cx || w / 2;
        cy = cy || h;
        cr = cr || h;
        // 坐标位于圆内
        return Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy)) <= cr;
    }

    // (x,y)在矩形(t,r,b,l)内
    function inRect(x, y, t, r, b, l) {
        // 如果不能转成数字类型，则失败
        if ( !(+x && +x+1) || !(+y && +y+1) ) return false;
        // 初始化坐标点
        t = t || 0;
        r = r || w;
        b = b || h;
        l = l || 0;
        // 坐标位于圆内
        return x >= l && x <= r && y >= t && y <= b;
    }

    // 获取背景图与canvas关系
    function getArg() {

        var bg_w = image_bg_w || 0,
            bg_h = image_bg_h || 0,
            bg_ratio = bg_w / bg_h,
            cv_ratio = w / h,
            arg = [];

        if (bg_ratio < cv_ratio) {
            arg = arg.concat([
                0, 0, bg_w, bg_h,
                (w - h * bg_ratio) / 2, 0, h * bg_ratio, h
            ]);
        } else {
            arg = arg.concat([
                (bg_w - bg_h * cv_ratio) / 2, 0, bg_h * cv_ratio, bg_h,
                0, 0, w, h
            ]);
        }
        return arg;
    }

    // 生成缓存canvas
    function getCanvas(width, height, callback) {

        // 生成canvas
        var _cvs = document.createElement('canvas'),
            _ctx = _cvs.getContext('2d');

        // 初始化宽高
        _cvs.width = +width || 100;
        _cvs.height = +height || 100;

        'function' === typeof callback && callback(_cvs, _ctx);

        return _cvs;
    }

    function isMobile () {
        return /mobile/.test(navigator.userAgent.toLowerCase());
    }

})(jQuery);
