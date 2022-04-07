$(function () {
    // 禁止后退
    window.history.forward(1);

    //    // 禁止鼠标右键
    //    if (window.Event && document.captureEvents) {
    //        document.captureEvents(Event.MOUSEUP);
    //    }
    //    function nocontextmenu() {
    //        event.cancelBubble = true
    //        event.returnValue = false;
    //        return false;
    //    }
    //    function norightclick(e) {
    //        if (window.Event) {
    //            if (e.which == 2 || e.which == 3) return false;
    //        }
    //        else if (event.button == 2 || event.button == 3) {
    //            event.cancelBubble = true
    //            event.returnValue = false;
    //            return false;
    //        }
    //    }
    //    document.oncontextmenu = nocontextmenu; // for IE5+ 
    //    document.onmousedown = norightclick;    // for all others 

    // 禁止选择文本
    //    var omitformtags = ["div", "label", "span"];
    //    function disableselect(e) {
    //        if (omitformtags.indexOf(e.target.tagName.toLowerCase()) == -1) { return false; }
    //    }
    //    function reEnable() {
    //        return true;
    //    }
    //    if (typeof document.onselectstart != "undefined") {
    //        document.onselectstart = new Function("return false");
    //    }
    //    else {
    //        document.onmousedown = disableselect;
    //        document.onmouseup = reEnable;
    //    }

    // 设置layui全局配置
    layui.layer.config({ anim: 1, skin: 'layui-layer-molv' }); // size: 'sm',
    layui.table.set({ page: true, even: true, loading: true, limit: 20, height: 'full-46', response: { statusName: 'State', statusCode: 1, msgName: 'Message', countName: 'Total', dataName: 'Rows' }, method: 'GET', done: function (res, curr, count) { ajaxSuccessPreprocessing(res); } });

    // 自定义验证规则
    layui.form.verify({ title: function (value) { if (value.length < 3) { return '至少得3个字符啊！'; } } });
    layui.form.verify({ remark: function (value) { if (value.length > 500) { return '输入不得大于500个字符！'; } } });
    layui.form.verify({ remark50: function (value) { if (value.length > 50) { return '输入不得大于50个字符！'; } } });
    layui.form.verify({ remark100: function (value) { if (value.length > 100) { return '输入不得大于100个字符！'; } } });
    layui.form.verify({ remark200: function (value) { if (value.length > 200) { return '输入不得大于200个字符！'; } } });
    layui.form.verify({ remark500: function (value) { if (value.length > 500) { return '输入不得大于500个字符！'; } } });
    layui.form.verify({ userName: function (value) { if (value.length < 3) { return '至少得3个字符啊！'; } return verifyByRegex(value, /^[\u4e00-\u9fa5A-Za-z0-9-_]*$/, '账户格式要求：只能中英文，数字，下划线，减号！'); } });
    layui.form.verify({ password: function (value) { return verifyByRegex(value, /^[\s\S]{6,18}$/, '密码格式要求：长度在6-18之间！'); } });
    layui.form.verify({ date: function (value) { return verifyByRegex(value, /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/, '输入的日期格式不正确！'); } });                                       // 判断日期类型是否为YYYY-MM-DD格式的类型
    layui.form.verify({ time: function (value) { return verifyByRegex(value, /^((20|21|22|23|[0-1]\d)\:[0-5][0-9])(\:[0-5][0-9])?$/, '输入的时间格式不正确！'); } });                        // 判断日期类型是否为hh:mm:ss格式的类型
    layui.form.verify({ datetime: function (value) { return verifyByRegex(value, /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/, '输入的日期时间格式不正确！'); } }); // 判断日期类型是否为YYYY-MM-DD hh:mm:ss格式的类型
    layui.form.verify({ letter: function (value) { return verifyByRegex(value, /^[a-zA-Z]+$/, '输入的英文字母类型格式不正确！'); } });
    layui.form.verify({ integer: function (value) { return verifyByRegex(value, /^[-+]?\d*$/, '输入的整数类型格式不正确！'); } });
    layui.form.verify({ intArray: function (value) { return verifyByRegex(value, /^[\d,]*$/, '输入的整数数组格式不正确！'); } });
    layui.form.verify({ double: function (value) { return verifyByRegex(value, /^[-\+]?\d+(\.\d+)?$/, '输入的小数类型格式不正确！'); } });
    layui.form.verify({ decimal: function (value) { return verifyByRegex(value, /^[-\+]?\d+(\.\d+)?$/, '输入的小数类型格式不正确！'); } });
    layui.form.verify({ chinese: function (value) { return verifyByRegex(value, /^[\u0391-\uFFE5]+$/, '输入的中文格式不正确！'); } });
    layui.form.verify({ email: function (value) { return verifyByRegex(value, /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/, '输入的邮箱格式不正确！'); } });
    layui.form.verify({ zip: function (value) { return verifyByRegex(value, /^\d{6}$/, '输入的邮编格式不正确！'); } });
    layui.form.verify({ tel: function (value) { return verifyByRegex(value, /^((\(\d{2,3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}(\-\d{1,4})?$/, '输入的电话格式不正确！'); } });
    layui.form.verify({ mobile: function (value) { return verifyByRegex(value, /^0?(1[0-9]{2})[0-9]{8}$/, '输入的手机号码格式不正确！'); } });
    layui.form.verify({ phone: function (value) { return verifyByRegexArray(value, [/^((\(\d{2,3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}(\-\d{1,4})?$/, /^0?(1[0-9]{2})[0-9]{8}$/], '输入的电话格式不正确！'); } });
    layui.form.verify({ sim: function (value) { return verifyByRegex(value, /^0?(1[0-9]{2})[0-9]{8,9}$/, '输入的SIM卡号格式不正确(11或12位)！'); } });
    layui.form.verify({ url: function (value) { return verifyByRegex(value, /^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/, '输入的URL格式不正确！'); } });
    layui.form.verify({ idCard: function (value) { return verifyByRegex(value, /^\d{15}(\d{2}[A-Za-z0-9])?$/, '输入的身份证号码格式不正确！'); } });
    layui.form.verify({ qq: function (value) { return verifyByRegex(value, /^[1-9]\d{4,8}$/, '输入的QQ号格式不正确！'); } });
    layui.form.verify({ vehicleLicense: function (value) { if (value.length < 3) { return '至少得3个字符啊'; } } });
    layui.form.verify({ vehicleMnfIdentity: function (value) { return verifyByRegex(value, /^[A-Za-z0-9]{12}$/, '输入的终端编号格式不正确（12位字符）！'); } });
    layui.form.verify({ custom: function (value) { return verifyByRegex(value, /(^$)|(^[\u4E00-\u9FA5a-zA-Z0-9,|]{1,250}$)/, '输入的格式不正确！'); } }); //自定义格式表示可以输入1-250个字的数字、汉字、字母、分隔符|

    // 设置jQuery Ajax全局的参数
    $.ajaxSetup({
        type: "POST",
        dataType: 'json',
        cache: false,
        async: true,
        //xhrFields: { withCredentials: true },//跨域请求带上cookies
        //crossDomain: true,//允许跨域
        //headers: { 'X-Requested-With': 'XMLHttpRequest' },
        error: function (jqXHR, textStatus, errorThrown) { ajaxErrorPreprocessing(jqXHR, textStatus, errorThrown); },
        success: function (result) { if (!ajaxSuccessPreprocessing(result)) return false; else return true; },
        beforeSend: function () { showAjaxLoading(); },
        complete: function () { closeAjaxLoading(); }
    });
});

var ajaxLoadingIdx = null;
function showAjaxLoading(msg) {
    if (msg == undefined || msg == '' || isNaN(msg)) msg = "获取数据...";
    ajaxLoadingIdx = layer.msg(msg, { icon: 16, shade: 0.01, time: 0 });
    return ajaxLoadingIdx;
}

function closeAjaxLoading() {
    layui.layer.close(ajaxLoadingIdx);
}

function ajaxErrorPreprocessing(jqXHR, textStatus, errorThrown) {
    closeAjaxLoading();
    switch (jqXHR.status) {
        case (500):
            layui.layer.msg('服务器系统内部错误', { icon: 5 });
            break;
        case (401):
            layui.layer.msg('未登录', { icon: 5 });
            break;
        case (403):
            layui.layer.msg('无权限执行此操作', { icon: 4 });
            break;
        case (408):
            layui.layer.msg('请求超时', { icon: 5 });
            break;
        default:
            if (errorThrown && errorThrown != '') { layui.layer.msg(errorThrown, { icon: 5 }); }
            else { layui.layer.msg('未知错误', { icon: 5 }); }
    }
}

// Ajax操作预处理，失败返回false，成功返回true
function ajaxSuccessPreprocessing(result) {
    closeAjaxLoading();
    if (!result) { layui.layer.msg('数据格式异常！', { icon: 5 }); return false; }
    if (result.State == undefined) return true;
    if (result.State == 2) { layui.layer.msg('未登录或登录已失效！', { icon: 5 }); return false; }
    if (result.State != 1) { layui.layer.msg(result.Message, { icon: 5 }); return false; }
    return true;
}

// Ajax操作预处理，失败返回false，成功返回true
function ajaxSuccessPreprocessingWithoutMsg(result) {
    closeAjaxLoading();
    if (!result) { return false; }
    if (result.State == 2) { return false; }
    if (result.State != 1) { return false; }
    return true;
}

function redirectErrorPage(errorThrown) {
    window.location.href = '/Home/Error';
}

function redirectSessionTimeoutPage() {
    window.location.href = '/Home/NoSession';
}

function verifyByRegex(value, reg, msg) {
    if (value == '') return;
    if (reg.test(value)) return;
    return msg;
}

function verifyByRegexArray(value, regArray, msg) {
    if (value == '') return;
    for (var i = 0; i < regArray.length; i++) if (regArray[i].test(value)) return;
    return msg;
}

function isDisplayThePage() {
    if (parent.getOpenFrame == undefined) return true;
    var ifm = parent.getOpenFrame();
    return ifm == null || (ifm != null && ifm != undefined && ifm.contentWindow == window);
}

///////////////////////////////////////////////////////////////////////////////////////////////////

//模拟浏览器全屏
function requestFullScreen() {
    var el = document.documentElement;
    var rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen;
    if (typeof rfs != "undefined" && rfs) {
        rfs.call(el);
    } else if (typeof window.ActiveXObject != "undefined") {
        //for IE，这里其实就是模拟了按下键盘的F11，使浏览器全屏
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript != null) {
            wscript.SendKeys("{F11}");
        }
    }
}

//退出浏览器全屏
function exitFullScreen() {
    var el = document;
    var cfs = el.cancelFullScreen || el.webkitCancelFullScreen || el.mozCancelFullScreen || el.exitFullScreen;
    if (typeof cfs != "undefined" && cfs) {
        cfs.call(el);
    }
    else if (typeof window.ActiveXObject != "undefined") {
        //for IE，这里和fullScreen相同，模拟按下F11键退出全屏
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript != null) {
            wscript.SendKeys("{F11}");
        }
    }
}

// 检测当前是否为全屏
function checkIsFullScreen() {
    var isFull = document.fullscreenEnabled || window.fullScreen || document.webkitIsFullScreen || document.msFullscreenEnabled;
    //to fix : false || undefined == undefined
    if (isFull === undefined) { isFull = false; }
    return isFull;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

function obj2json(obj) {
    var arr = [];
    for (var v in obj) {
        if (Object.prototype.toString.call(obj[v]) === '[object Array]') {
            arr.push(v + ":" + array2jsonArray(obj[v]) + "");
        }
        else {
            arr.push(v + ":'" + obj[v] + "'");
        }
    }
    return "{" + arr.join(',') + "}";
}

function array2jsonArray(array) {
    var arr = [];
    for (var i = 0; i < array.length; i++) {
        arr.push(obj2json(array[i]));
    }
    return "[" + arr.join(',') + "]";
}

///////////////////////////////////////////////////////////////////////////////////////////////////

// 时间对象的格式化;  
Date.prototype.format = function (format) {
    // eg:format="YYYY-MM-dd hh:mm:ss";  
    var o = {
        "M+": this.getMonth() + 1,                      // month  
        "d+": this.getDate(),                           // day  
        "h+": this.getHours(),                          // hour  
        "m+": this.getMinutes(),                        // minute  
        "s+": this.getSeconds(),                        // second  
        "q+": Math.floor((this.getMonth() + 3) / 3),    // quarter  
        "S": this.getMilliseconds()                     // millisecond  
    }

    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }

    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
}

// 计算秒数
Date.prototype.totalSeconds = function (date) {
    var valueOfDate = this.valueOf();
    var valueOfOther = date.valueOf();
    return valueOfDate - valueOfOther;
}

// 添加天
Date.prototype.addDays = function (days) {
    var valueOfDate = this.valueOf();
    valueOfDate = valueOfDate + days * 24 * 60 * 60 * 1000;
    return new Date(valueOfDate);
}

// 添加小时
Date.prototype.addHours = function (hours) {
    var valueOfDate = this.valueOf();
    valueOfDate = valueOfDate + hours * 60 * 60 * 1000;
    return new Date(valueOfDate);
}

// 添加小秒
Date.prototype.addSeconds = function (seconds) {
    var valueOfDate = this.valueOf();
    valueOfDate = valueOfDate + seconds * 1000;
    return new Date(valueOfDate);
}

///////////////////////////////////////////////////////////////////////////////////////////////////

// 时间戳转换为 Date  "/Date(13524251000)/"
String.prototype.toDate = function (format) {
    try {
        var date = eval('new ' + this.replace('/', '').replace('/', ''));
        return date;
    }
    catch (e) {
        var arr1 = this.split(" ");
        var sdate = arr1[0].split('-');
        var stime = arr1[1].split(':');
        if (stime.length > 0) {
            date = new Date(sdate[0], sdate[1] - 1, sdate[2], stime[0], stime[1], stime[2]);
        }
        else {
            date = new Date(sdate[0], sdate[1] - 1, sdate[2]);
        }
        return date;
    }
}

// 时间戳转换为 Date  "/Date(13524251000)/"
String.prototype.getTimeText = function (format) {
    try {
        //兼容IE浏览器不支持的日期格式,IE不支持 - 分隔的日期字符串
        //2021-02-01 01:23:25 格式，改成 2021/02/01 01:23:25
        var v1 = this.replace('T', ' ');
        var v2 = v1.replace(/-/g, "/");
        var date = new Date(v2);
        //var date = eval('new Date(' + this.replace('/', '').replace('/', '') + ')');
        return date.format(format);
    }
    catch (e) {
        var arr1 = this.split(" ");
        var sdate = arr1[0].split('-');
        var stime = arr1[1].split(':');
        if (stime.length > 0) {
            date = new Date(sdate[0], sdate[1] - 1, sdate[2], stime[0], stime[1], stime[2]);
        }
        else {
            date = new Date(sdate[0], sdate[1] - 1, sdate[2]);
        }
        return date.format(format);
    }
}

String.prototype.endWithArray = function (strArray) {
    for (var i = 0; i < strArray.length; i++) {
        if (this.endWith(strArray[i])) return true;
    }
    return false;
};

String.prototype.endWith = function (str) {
    if (str == null || str == "" || this.length == 0 || str.length > this.length) return false;
    if (this.substring(this.length - str.length) == str) return true;
    return false;
};

String.prototype.startWith = function (str) {
    if (str == null || str == "" || this.length == 0 || str.length > this.length) return false;
    if (this.substr(0, str.length) == str) return true;
    return false;
};

//获取结束时间字符串(将结束日期字符串换成结束时间字符串)
String.prototype.getEndDayTime = function () {
    if (this == undefined || this == null || this.trim() == '') {
        return '';
    }
    // 字符串满足格式:XXXX-XX-XX 如：'2021-03-29'
    var isDateFormat = (/^(\d{4}-\d{2}-\d{2})$/).test(this);
    if (isDateFormat) {
        return this + ' 23:59:59';
    } else {
        return this;
    }
}


///////////////////////////////////////////////////////////////////////////////////////////////////
// 行政区域下拉列表公共方法
var initGeographyDropDownListGroup = function (provinceId, cityId, countyId, provinceSelected, citySelected, countySelected, provinceEmptyOption, cityEmptyOption, countyEmptyOption, provinceChangeCallback, cityChangeCallback, countyChangeCallback) {
    initGeographyDropDownList(provinceId, provinceSelected, null, provinceEmptyOption);
    initGeographyDropDownList(cityId, citySelected, provinceSelected, cityEmptyOption);
    initGeographyDropDownList(countyId, countySelected, citySelected, countyEmptyOption);
    layui.form.render('select'); //刷新select选择框渲染

    // 双重事件绑定，一个面向layui事件，一个面向js事件
    $('#' + provinceId).change(function () {
        var sel = $('#' + provinceId).val();
        if (sel == '') {
            initGeographyDropDownList(cityId, '', '', cityEmptyOption);
            initGeographyDropDownList(countyId, '', '', countyEmptyOption);
        }
        else {
            initGeographyDropDownList(cityId, '', sel, cityEmptyOption);
            initGeographyDropDownList(countyId, '', '', countyEmptyOption);
        }
        layui.form.render('select'); //刷新select选择框渲染
        if (provinceChangeCallback != undefined && provinceChangeCallback != null) provinceChangeCallback();
    });
    $('#' + cityId).change(function () {
        var sel = $('#' + cityId).val();
        if (sel == '') {
            initGeographyDropDownList(countyId, '', '', countyEmptyOption);
        }
        else {
            initGeographyDropDownList(countyId, '', sel, countyEmptyOption);
        }
        layui.form.render('select'); //刷新select选择框渲染
        if (cityChangeCallback != undefined && cityChangeCallback != null) cityChangeCallback();
    });
    $('#' + countyId).change(function () {
        if (countyChangeCallback != undefined && countyChangeCallback != null) countyChangeCallback();
    });

    // 双重事件绑定，一个面向layui事件，一个面向js事件
    var provinceFilter = $("#" + provinceId).attr('lay-filter');
    var cityFilter = $("#" + cityId).attr('lay-filter');
    var countyFilter = $("#" + countyId).attr('lay-filter');
    layui.form.on('select(' + provinceFilter + ')', function (data) {
        if (data.value == '') {
            initGeographyDropDownList(cityId, '', '', cityEmptyOption);
            initGeographyDropDownList(countyId, '', '', countyEmptyOption);
        }
        else {
            initGeographyDropDownList(cityId, '', data.value, cityEmptyOption);
            initGeographyDropDownList(countyId, '', '', countyEmptyOption);
        }
        layui.form.render('select'); //刷新select选择框渲染
        if (provinceChangeCallback != undefined && provinceChangeCallback != null) provinceChangeCallback();
    });
    layui.form.on('select(' + cityFilter + ')', function (data) {
        if (data.value == '') {
            initGeographyDropDownList(countyId, '', '', countyEmptyOption);
        }
        else {
            initGeographyDropDownList(countyId, '', data.value, countyEmptyOption);
        }
        layui.form.render('select'); //刷新select选择框渲染
        if (cityChangeCallback != undefined && cityChangeCallback != null) cityChangeCallback();
    });
    layui.form.on('select(' + countyFilter + ')', function (data) {
        if (countyChangeCallback != undefined && countyChangeCallback != null) countyChangeCallback();
    });
}

var initGeographyDropDownList = function (id, sel, pid, emptyOption) {
    $("#" + id).html("");
    var array = getGeographyArray(pid, emptyOption);
    $.each(array, function () {
        var d = $(this)[0];
        if (d.id == sel) {
            $("#" + id).append("<option value=\"" + d.id + "\" selected=\"selected\">" + d.name + "</option>");
        } else {
            $("#" + id).append("<option value=\"" + d.id + "\">" + d.name + "</option>");
        }
    });
    layui.form.render('select'); //刷新select选择框渲染
}

var setGeographyProvinceName = function (provinceId, provinceName) {
    var optionArray = $("#" + provinceId + " option");
    for (var i = 0; i < optionArray.length; i++) {
        var option = optionArray[i];
        if (option.text == provinceName) {
            $(option).attr('selected', true);

            $('#' + provinceId).val(option.value).change();
            layui.form.render('select'); //刷新select选择框渲染
            break;
        }
    }
}

var setGeographyCityName = function (cityId, cityName) {
    var optionArray = $("#" + cityId + " option");
    for (var i = 0; i < optionArray.length; i++) {
        var option = optionArray[i];
        if (option.text == cityName) {
            $(option).attr('selected', true);

            $('#' + cityId).val(option.value).change();
            layui.form.render('select'); //刷新select选择框渲染
            break;
        }
    }
}

var setGeographyCountyName = function (ddlCounty, countyName) {
    var optionArray = $("#" + ddlCounty + " option");
    for (var i = 0; i < optionArray.length; i++) {
        var option = optionArray[i];
        if (option.text == countyName) {
            $(option).attr('selected', true);

            $('#' + ddlCounty).val(option.value).change();
            layui.form.render('select'); //刷新select选择框渲染
            break;
        }
    }
}

var getGeographyArray = function (pid, emptyOption) {
    var newArray = new Array();
    if (emptyOption != undefined && emptyOption != '') {
        newArray.push({ id: '', pid: '', name: emptyOption });
        if (pid == '') return newArray;
    }

    for (i = 0; i < geographyData.length; i++) {
        if (geographyData[i].pid == pid) {
            newArray.push(geographyData[i]);
        }
    }
    return newArray;
}

var getFileName = function (data, type) {
    if (type == 0) {
        return data.substring(0, data.lastIndexOf("."));
    } else {
        return data.substring(0, data.indexOf("."));
    }
}

function setEnterpriseUsingSelfSettingIncludeChildren(cbxIncludeAllChildrenName) {
    if ((passport.Property & 0x0008) > 0 && (passport.Property & 0x0001) <= 0) { $(cbxIncludeAllChildrenName).attr("checked", false); $(cbxIncludeAllChildrenName).attr("disabled", "disabled"); }
}