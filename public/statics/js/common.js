/**
 * 公共js类库
 * Created by lvpengfei on 16/4/28.
 */

/**
 * input只能输入整数
 * 使用方法
 * input里加上onkeyup属性
 * onkeyup="input_area_require(this)"
 * @param obj
 */
function input_integer(obj) {
    $(obj).val($(obj).val().replace(/[^\d]/g,''));
}

/**
 * input只能输入number 可以带小数点
 * 使用方法
 * input里加上onkeyup属性
 * onkeyup="input_area_require(this)"
 * @param obj
 */
function input_number(obj) {
    $(obj).val($(obj).val().replace(/[^\d\.]/g,''));
}

/**
 * input只能输入字母和数字
 * 使用方法
 * input里加上onkeyup属性
 * onkeyup="input_area_require(this)"
 * @param obj
 */
function input_alphabet_number(obj) {
    $(obj).val($(obj).val().replace(/[^a-zA-Z0-9]*/g, ''));
}

/**
 *  锚点(Anchor)间平滑跳转
 * @param el 块id
 * @param duration 跳转时间毫秒
 * eg: scroller('edit_rooms', 100);

 */


function scroller(el, duration)
{
    if(typeof el != 'object') { el = document.getElementById(el); }

    if(!el) return;

    var z = this;
    z.el = el;
    z.p = getPos(el);
    z.s = getScroll();
    z.clear = function(){window.clearInterval(z.timer);z.timer=null};
    z.t=(new Date).getTime();

    z.step = function(){
        var t = (new Date).getTime();
        var p = (t - z.t) / duration;
        if (t >= duration + z.t) {
            z.clear();
            window.setTimeout(function(){z.scroll(z.p.y, z.p.x)},13);
        } else {
            st = ((-Math.cos(p*Math.PI)/2) + 0.5) * (z.p.y-z.s.t) + z.s.t;
            sl = ((-Math.cos(p*Math.PI)/2) + 0.5) * (z.p.x-z.s.l) + z.s.l;
            z.scroll(st, sl);
        }
    };
    z.scroll = function (t, l){window.scrollTo(l, t)};
    z.timer = window.setInterval(function(){z.step();},13);
}

/**
 * input只能输入float 小数点最多num位
 * 使用方法
 * input里加上onkeyup属性
 * onkeyup="input_float(event,num)"
 * @param e
 * @param num
 */
function input_float(e,num) {
    var obj = e.target;
    var tmp1 = $(obj).val().replace(/[^0-9,\.]/g,'');
    if(tmp1){
        var tmp2 = tmp1.split('.');
        var zhengshu = tmp2[0];
        var xiaoshu;
        if(tmp2[1]){
            xiaoshu = tmp2[1].substr(0,num);
        }
        var re = zhengshu+((xiaoshu)?('.'+xiaoshu):'');
        if(e.keyCode == 190){
            re = re + '.';
        }
        $(obj).val(re);
    }else {
        $(obj).val('');
    }
}
/**
 * input只能输入百分比值 100以内不包含(100)整数最多小数点2位
 * 使用方法
 * input里加上onkeyup属性
 * onkeyup="input_proportion(event)"
 * @param e
 */
function input_proportion(e) {
    var obj = e.target;
    var tmp1 = $(obj).val().replace(/[^0-9,\.]/g,'');
    if(tmp1){
        var tmp2 = tmp1.split('.');
        var zhengshu = tmp2[0].substr(0,2);
        var xiaoshu;
        if(tmp2[1]){
            xiaoshu = tmp2[1].substr(0,2);
        }
        var re = zhengshu+((xiaoshu)?('.'+xiaoshu):'');
        if(e.keyCode == 190){
            re = re + '.';
        }
        $(obj).val(re);
    }else {
        $(obj).val('');
    }
}

// 转换为数字
function intval(v)
{
    v = parseInt(v);
    return isNaN(v) ? 0 : v;
}

// 获取元素信息
function getPos(e)
{
    var l = 0;
    var t = 0;
    var w = intval(e.style.width);
    var h = intval(e.style.height);
    var wb = e.offsetWidth;
    var hb = e.offsetHeight;
    while (e.offsetParent){
        l += e.offsetLeft + (e.currentStyle?intval(e.currentStyle.borderLeftWidth):0);
        t += e.offsetTop + (e.currentStyle?intval(e.currentStyle.borderTopWidth):0);
        e = e.offsetParent;
    }
    l += e.offsetLeft + (e.currentStyle?intval(e.currentStyle.borderLeftWidth):0);
    t += e.offsetTop + (e.currentStyle?intval(e.currentStyle.borderTopWidth):0);
    return {x:l, y:t, w:w, h:h, wb:wb, hb:hb};
}

// 获取滚动条信息
function getScroll()
{
    var t, l, w, h;

    if (document.documentElement && document.documentElement.scrollTop) {
        t = document.documentElement.scrollTop;
        l = document.documentElement.scrollLeft;
        w = document.documentElement.scrollWidth;
        h = document.documentElement.scrollHeight;
    } else if (document.body) {
        t = document.body.scrollTop;
        l = document.body.scrollLeft;
        w = document.body.scrollWidth;
        h = document.body.scrollHeight;
    }
    return { t: t, l: l, w: w, h: h };
}


/**
 * input大小范围判断
 * 参数 min 范围下限 input id, max 范围上限 input id
 * */
function blurRange(min,max) {
    var obj_min = Number($("."+min).val());
    var obj_max = Number($("."+max).val());
    if(obj_min > obj_max) {
        obj_max > 0 && $("."+max).val('');
    }
}

/**
 * 判断ajax error 错误状态码HttpRequest
 * */
function initHttpRequestCode(code) {
    switch(code)
    {
        case 500:
            layer.msg('系统错误,请稍后再试!');
            break;
        case 401:
            layer.msg('登录态失效,即将跳转到登录页面...')
            window.setTimeout(function() {
                window.location.href = "/auth/login";
            }, 3000);
            break;
        case 403:
            layer.msg('您没有权限访问,请联系管理员');
            break;
        default:
            layer.msg('未定义错误');
    }
}