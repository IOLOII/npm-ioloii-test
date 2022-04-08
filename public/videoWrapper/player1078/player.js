var debug = true;
var playerPlayCurrTime =new Date();// !avStartTime||avStartTime == '' ? new Date() : avStartTime.toDate();
var showControlBarTimeoutId = null;
var playIntervalTimerId = null;
var sliderBrightness = null;
var sliderContrast = null;
var sliderSaturation = null;
var sliderChroma = null;
var settingBrightness = 10;
var settingContrast = 10;
var settingSaturation = 10;
var settingChroma = 10;
var dlgSetting = null;
var jvp = undefined;
var jvpStartCommunication = false;


	function getQueryString(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return decodeURI(r[2]); // unescape(r[2]);
            return null;
        }
		

	  var id = getQueryString("id");
        var vehicleId = getQueryString("vid");
        var vehicleNumber = getQueryString("vnumber");
        var channelId = getQueryString("cid");
        var w = getQueryString("wt");
        var h = getQueryString("ht");
        var bgColor = getQueryString("bgColor");
        var videoUrl = getQueryString("url");
        var avStartTime = getQueryString("startTime");
        var bitStreamType = "1";//getQueryString("bst");
        var avFlag = getQueryString("avFlag");
        var muted =getQueryString("muted") == "true";
        var subtitleDisplay = getQueryString("sdp");
        var beforeVolume = muted ? 0 : 1.0;
        var playback = getQueryString("playback") == "true";
        var usingMicrophone = getQueryString("ump") == "true";
        var usingControlBar = getQueryString("vcb") != "false";
        var bufferTime = getQueryString("bufferTime");
        var liveAppName = 'LHT';
        var videoId = id + '_video';

///////////////////////////////////////////////////////////////////////////////////////////////////

$(function () {
	  
		  var html = '';
		  
		   html += '<div id="'+id+'" style="width:'+w+'px;height:'+h+'px;" class="video-js vjs-waiting" data-setup="{}">';
           html += '<video id="'+id+'_video" autoplay="autoplay" style="width:100%; height:100%; object-fit: fill"></video>';
           html += '<canvas id="'+id+'_canvas"></canvas>';
		   html +='<div></div>';
		   html +='   <div class="vjs-loading-spinner" dir="ltr"></div>';
		   html +='   <div class="vjs-poster vjs-hidden"></div>';
		   html +='   <button class="vjs-big-play-button" title="Play Video" type="button"><span class="vjs-control-text">Play Video</span></button>';
		   html +='   <div class="vjs-throughput-display"></div>';
		   html +='   <div class="vjs-control-bar" role="group" dir="ltr">';
		   html +='       <button class="vjs-control vjs-control-playing" type="button" title="暂停"><span class="vjs-control-text">暂停</span></button>';
		   html +='       <div class="vjs-control vjs-button-volume-menu vjs-control-menu vjs-volume-menu-vertical" title="静音" role="button">';
		   html +='           <div class="vjs-menu">';
		   html +='               <div class="vjs-menu-content">';
		   html +='                   <div class="vjs-volume-bar" role="slider" aria-valuenow="100.00" aria-valuemin="0" aria-valuemax="100" aria-label="volume level" aria-valuetext="100.00%">';
		   html +='                       <div class="vjs-volume-level"><span class="vjs-control-text"></span></div>';
		   html +='                   </div>';
		   html +='               </div>';
		   html +='           </div>';
		   html +='           <span class="vjs-control-text">静音</span>';
		   html +='       </div>';
		   html +='       <button class="vjs-control vjs-control-right vjs-icon-pinterest" type="button" title="设置"><span class="vjs-control-text">设置</span></button>';
		   
		   html +='       <button class="vjs-control vjs-control-right vjs-control-fullscreen" type="button" title="全屏"><span class="vjs-control-text">全屏</span></button>';
		   html +='       <button class="vjs-control vjs-control-right vjs-control-screenshot" type="button" title="截屏"><span class="vjs-control-text-value">截屏</span></button>';
		   html +='       <div class="vjs-control vjs-control-right vjs-control-menu vjs-control-size" title="播放尺寸">';
		   html +='           <div class="vjs-menu">';
		   html +='               <ul class="vjs-menu-content">';
		   html +='                   <li class="vjs-menu-item vjs-selected">全屏</li>';
		   html +='                   <li class="vjs-menu-item">4:3</li>';
		   html +='                   <li class="vjs-menu-item">16:9</li>';
		   html +='               </ul>';
		   html +='           </div>';
		   html +='           <span class="vjs-control-text">尺寸</span>';
		   html +='           <div class="vjs-control-text-value">全屏</div>';
		   html +='       </div>';
		   html +='       <div class="vjs-control vjs-control-right vjs-control-menu vjs-control-bitstream" title="播放码率">';
		   html +='           <div class="vjs-menu">';
		   html +='               <ul class="vjs-menu-content">';
		   html +='                   <li class="vjs-menu-item '+(bitStreamType == "0" ? "vjs-selected" : "")+'">主码流</li>';
		   html +='                   <li class="vjs-menu-item '+(bitStreamType == "0" ? "" : "vjs-selected")+'">子码流</li>';
		   html +='               </ul>';
		   html +='           </div>';
		   html +='           <span class="vjs-control-text">码率</span>';
		   html +='           <div class="vjs-control-text-value"> '+(bitStreamType == "0" ? "主码流" : "子码流")+'</div>';
		   html +='       </div>';
		   html +='       <div class="vjs-control vjs-control-right vjs-control-menu vjs-control-subtitle" title="字幕显示">';
		   html +='           <div class="vjs-menu">';
		   html +='               <ul class="vjs-menu-content">';
		   html +='                   <li class="vjs-menu-item '+(subtitleDisplay== "1" ? "vjs-selected" : "")+'">字幕开</li>';
		   html +='                   <li class="vjs-menu-item '+(subtitleDisplay == "1" ? "" : "vjs-selected")+'">字幕关</li>';
		   html +='               </ul>';
		   html +='           </div>';
		   html +='           <span class="vjs-control-text">字幕</span>';
		   html +='           <div class="vjs-control-text-value">'+(subtitleDisplay == "1" ? "字幕开" : "字幕关")+'</div>';
		   html +='       </div>';
		   html +='       <div class="vjs-control vjs-control-right vjs-control-menu vjs-control-playback" title="回放控制">';
		   html +='           <div class="vjs-menu">';
		   html +='               <ul class="vjs-menu-content">';
		   html +='                   <li class="vjs-menu-item">正常</li>';
		   html +='                   <li class="vjs-menu-item">暂停</li>';
		   html +='                   <li class="vjs-menu-item">结束</li>';
		   html +='                   <li class="vjs-menu-item">关键帧</li>';
		   html +='                   <li class="vjs-menu-item">快进X1</li>';
		   html +='                   <li class="vjs-menu-item">快进X2</li>';
		   html +='                   <li class="vjs-menu-item">快进X4</li>';
		   html +='                   <li class="vjs-menu-item">快进X8</li>';
		   html +='                   <li class="vjs-menu-item">快进X16</li>';
		   html +='                   <li class="vjs-menu-item">关键帧快退X1</li>';
		   html +='                   <li class="vjs-menu-item">关键帧快退X2</li>';
		   html +='                   <li class="vjs-menu-item">关键帧快退X4</li>';
		   html +='                   <li class="vjs-menu-item">关键帧快退X8</li>';
		   html +='                   <li class="vjs-menu-item">关键帧快退X16</li>';
		   html +='               </ul>';
		   html +='           </div>';
		   html +='           <span class="vjs-control-text">回放控制</span>';
		   html +='           <div class="vjs-control-text-value">正常</div>';
		   html +='       </div>';
		   html +='   </div></div>';

		   html +='<div id="divEditDialog" style="display:none;">';
		   html +='       <div class="layui-form" lay-filter="divEditDialog">';
		   html +='           <div class="layui-form-item">';
		   html +='               <label class="layui-form-label" style="width:60px">亮度</label>';
		   html +='               <div class="layui-input-block"  style="width:70px;"><div id="txtBrightness" style="margin:0; display: inline-block;width:200px;"></div></div>';
		   html +='           </div>';
		   html +='           <div class="layui-form-item">';
		   html +='               <label class="layui-form-label" style="width:60px">对比度</label>';
		   html +='               <div class="layui-input-block"  style="width:70px;"><div id="txtContrast" style="margin:0; display: inline-block;width:200px;"></div></div>';
		   html +='           </div>';
		   html +='           <div class="layui-form-item">';
		   html +='               <label class="layui-form-label" style="width:60px">饱和度</label>';
		   html +='               <div class="layui-input-block"  style="width:70px;"><div id="txtSaturation" style="margin:0; display: inline-block;width:200px;"></div></div>';
		   html +='           </div>';
		   html +='           <div class="layui-form-item">';
		   html +='               <label class="layui-form-label" style="width:60px">色度</label>';
		   html +='               <div class="layui-input-block"  style="width:70px;"><div id="txtChroma" style="margin:0; display: inline-block;width:200px;"></div></div>';
		   html +='           </div>';
		   html +='           <div class="layui-form-item layui-form-button">';
		   html +='               <button class="layui-btn" lay-submit="" lay-filter="btnEditSubmit">设置</button>';
		   html +='               <button class="layui-btn layui-btn-primary" id="btnEditCancel">放弃</button>';
		   html +='           </div>';
		   html +='       </div>';
		   html +='   </div>';

	 
	 $('body').append(html); 
	
	
	
    $('.vjs-control-screenshot').hide();
    if (!parent.videoSwitchBitstream) $('.vjs-control-bitstream').hide();
    if (!parent.videoSwitchSubtitle) $('.vjs-control-subtitle').hide();
    if (!parent.videoPlaybackControl) $('.vjs-control-playback').hide();
    if (!usingControlBar) $('.vjs-control-bar').hide();
    if (usingMicrophone) $('.vjs-control-fullscreen').hide();
    if (usingMicrophone) $('.vjs-control-size').hide();
    if (usingMicrophone) $('.vjs-control-bitstream').hide();

    // 提交表单事件
    sliderBrightness = layui.slider.render({ elem: '#txtBrightness', min: -100, max: 100, value: settingBrightness, input: true, change: function (value) { settingBrightness = value; } });
    sliderContrast = layui.slider.render({ elem: '#txtContrast', min: -100, max: 100, value: settingContrast, input: true, change: function (value) { settingContrast = value; } });
    sliderSaturation = layui.slider.render({ elem: '#txtSaturation', min: -100, max: 100, value: settingSaturation, input: true, change: function (value) { settingSaturation = value; } });
    sliderChroma = layui.slider.render({ elem: '#txtChroma', min: -180, max: 180, value: settingChroma, input: true, change: function (value) { settingChroma = value; } });
    layui.form.on('submit(btnEditSubmit)', function (data) {
        var swfId = id + '_Flash_api';
        document.getElementById(swfId).vjs_setProperty('brightness', settingBrightness);
        document.getElementById(swfId).vjs_setProperty('contrast', settingContrast);
        document.getElementById(swfId).vjs_setProperty('saturation', settingSaturation);
        document.getElementById(swfId).vjs_setProperty('chrom', settingChroma);

        // 给终端也设置一次 TMLParameterSettingPhoto(string vehicleIdArray, int? cancelMinutes, byte? mediaQuality, byte? mediaLuminance, byte? mediaContrast, byte? mediaSaturation, byte? mediaChroma)
        var mediaLuminance = parseInt((settingBrightness + 100) / 200 * 255);   // 0-255
        var mediaContrast = parseInt((settingContrast + 100) / 200 * 127);      // 0-127
        var mediaSaturation = parseInt((settingSaturation + 100) / 200 * 127);  // 0-127
        var mediaChroma = parseInt((settingChroma + 180) / 360 * 255);          // 0-255
        $.ajax({
            url: '/MonitorMgr/TMLSetting/TMLParameterSettingPhoto',
            data: { vehicleIdArray: vehicleId, cancelMinutes: '', mediaQuality: '', mediaLuminance: mediaLuminance, mediaContrast: mediaContrast, mediaSaturation: mediaSaturation, mediaChroma: mediaChroma },
            beforeSend: function () { },
            success: function (result, textStatus) {
                if (!ajaxSuccessPreprocessing(result)) return false;

                // 重置页大小为4，以供展示一台车的四个设备
                var channelTotal = vehicle.ExtInstalledParamters.VideoChannelArray.length;
                currVehicle = vehicle;
                currPageSize = channelTotal == 1 ? 1 : channelTotal == 2 ? 2 : channelTotal <= 4 ? 4 : channelTotal <= 6 ? 6 : 8;

                autoPlayVehicleId = vehicle.VehicleId;
                refreshVideoArray(1, currPageSize, true);
            }
        });

        $('#divEditDialog').hide();
        layui.layer.close(dlgSetting);
        return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
    });
    $("#btnEditCancel").click(function (data) { $('#divEditDialog').hide(); layui.layer.close(dlgSetting); return false; });

    $('.video-js').on("mouseover", function () {
        if (!usingControlBar) return;
        if (showControlBarTimeoutId != null) window.clearTimeout(showControlBarTimeoutId);
        $('.vjs-control-menu').removeClass('vjs-conrol-menu-popup');
        $('.video-js').find('.vjs-control-bar').fadeIn();
    });
    $('.video-js').on("mouseout", function () {
        if (!usingControlBar) return;
        if (showControlBarTimeoutId != null) window.clearTimeout(showControlBarTimeoutId);
        $('.vjs-control-menu').removeClass('vjs-conrol-menu-popup');
        showControlBarTimeoutId = window.setTimeout(function () { $('.video-js').find('.vjs-control-bar').fadeOut(); showControlBarTimeoutId = null; }, 2000);
    });
    $('.vjs-control-menu').on("mouseover", function () { $(this).addClass('vjs-control-menu-popup'); });
    $('.vjs-control-menu').on("mouseout", function () { $(this).removeClass('vjs-control-menu-popup'); });

    $('.vjs-control-playing').on("click", stopVideo);
    $('.vjs-button-volume-menu').on("click", toggleActualVolumeMute);
    $('.vjs-control-fullscreen').on("click", toggleFullScreen);
    $('.vjs-control-screenshot').on("click", screenShot);
    $('.vjs-icon-pinterest').on("click", openSetting);
    $('.vjs-menu-item').on("click", onMenuItemDistrict);

    //监听全屏状态变化
    if (window.addEventListener) {
        document.addEventListener('fullscreenchange', toggleFullScreenClass);
        document.addEventListener('webkitfullscreenchange', toggleFullScreenClass);
        document.addEventListener('mozfullscreenchange', toggleFullScreenClass);
        document.addEventListener('MSFullscreenChange', toggleFullScreenClass);
    }

    // 播放
    var cfg = {
        jtt1078Version: '2011',   // 2011、2019
        onWaiting: function (jvp) { $("#" + videoId).parent().addClass('vjs-waiting'); },
        onPlaying: function (jvp) {
            $("#" + videoId).parent().removeClass('vjs-waiting');
            if (!usingMicrophone) $('.vjs-control-screenshot').show();
            if (usingMicrophone && !jvpStartCommunication) { jvpStartCommunication = true; jvp.startCommunication(); } // 避免二次打开，导致重复录制声音数据
        },
        onEvent: function (jvp, eventName) { },
        onError: function (jvp, data) { },
        onTimeUpdate: playIntervalTimerFunction
    };
	
	console.dir(videoId);

    // rtmp://{0}:{1}/{2}/{3}_{4}?uid={5}  muted="muted"
    var array = videoUrl.split('/');
    var array1 = videoUrl.split('?');
    var wsProtocol = 'ws'; //usingMicrophone ? "ws" : "http";
    var wsIPPort = array[2].split(':');
    var wsIP = wsIPPort[0];
    var wsPort = wsIPPort[1];
    var wsChannelName = 'CH' + channelId;
    var wsAvFlag = avFlag == 0 ? 0 : avFlag == 1 ? 2 : avFlag == 3 ? 1 : 0;
    var wsVideoKey = 'ApexHu';
    var wsVideoName = vehicleNumber + '.Color.' + channelId + '.' + wsAvFlag + '.' + wsVideoKey;
    var wsParams = array1.length > 1 ? array1[1] : '';


    var video = document.getElementById(videoId);
	
	 
    this.jvp = new Jvp(cfg); 
	
	console.dir('JTT1078'); 
	console.dir(wsChannelName);
	console.dir(video);
	console.dir(wsProtocol);
	console.dir(wsIP);
	console.dir(wsPort);
	console.dir(wsVideoName);
	console.dir(wsParams);
	 
	
     this.jvp.attachMedia(video, wsChannelName, 'JTT1078', wsProtocol, wsIP, wsPort, wsVideoName, wsParams);
    if (muted) $('.vjs-button-volume-menu').click();
	
	
});


function playIntervalTimerFunction(jvp, eventName, currentTime, receivedBytesPerSecond, uploadBytesPerSecond) {

    var playTime = playerPlayCurrTime.addSeconds(currentTime);
    if (currentTime > 0) {
        //if (parent.showVideoMessage) parent.showVideoMessage(null, '正在播放视频...');
        if (parent.runToTrackByTime) parent.runToTrackByTime(false, playTime);
    }

    var kps = receivedBytesPerSecond;
    var kpsText = kps.toFixed(0) + 'B/S';
    if (kps > 1024) {
        kps = kps / 1024;
        if (kps < 1024) kpsText = kps.toFixed(1) + 'KB/S';
        else {
            kps = kps / 1024;
            if (kps < 1024) kpsText = kps.toFixed(1) + 'MB/S';
            else {
                kps = kps / 1024;
                kpsText = kps.toFixed(1) + 'GB/S';
            }
        }
    }

    var kps2 = uploadBytesPerSecond;
    var kpsText2 = kps2.toFixed(0) + 'B/S';
    if (kps2 > 1024) {
        kps2 = kps2 / 1024;
        if (kps2 < 1024) kpsText2 = kps2.toFixed(1) + 'KB/S';
        else {
            kps2 = kps2 / 1024;
            if (kps2 < 1024) kpsText2 = kps2.toFixed(1) + 'MB/S';
            else {
                kps2 = kps2 / 1024;
                kpsText2 = kps2.toFixed(1) + 'GB/S';
            }
        }
    }

    $("#" + videoId).parent().find('.vjs-throughput-display').html(kpsText);
    if (parent.onPlayerTimeUpdate) parent.onPlayerTimeUpdate(videoId, playTime, receivedBytesPerSecond, kpsText);
    if (parent.onPlayerTimeUpdate && usingMicrophone) parent.onPlayerTimeUpdate(id + '_micro', playTime, uploadBytesPerSecond, kpsText2);
}

///////////////////////////////////////////////////////////////////////////////////////////////////

// 菜单按钮事件分发
function onMenuItemDistrict() {
    $(this).parent().children().removeClass("vjs-selected");
    $(this).addClass("vjs-selected");

    var eventName = $(this).html();
    if (eventName == "全屏") {
        $('#' + videoId).css('margin-top', '0px');
        $('#' + videoId).css('margin-left', '0px');
    }
    else if (eventName == "4:3") {
        $('#' + videoId).css('width', '100%');
        $('#' + videoId).css('height', '100%');
        $('#' + videoId).css('margin-top', '0px');
        $('#' + videoId).css('margin-left', '0px');

        var w = $('#' + videoId).width();
        var h = $('#' + videoId).height();
        var h1 = parseInt(w / 4.0 * 3.0);
        if (h1 < h) {
            $('#' + videoId).css('height', '' + h1 + 'px');
            $('#' + videoId).css('margin-top', '' + ((h - h1) / 2) + 'px');
        }
        else if (h1 > h) {
            var w1 = parseInt(h / 3.0 * 4.0);
            $('#' + videoId).css('width', '' + w1 + 'px');
            $('#' + videoId).css('margin-left', '' + ((w - w1) / 2) + 'px');
        }
    }
    else if (eventName == "16:9") {
        $('#' + videoId).css('width', '100%');
        $('#' + videoId).css('height', '100%');
        $('#' + videoId).css('margin-top', '0px');
        $('#' + videoId).css('margin-left', '0px');

        var w = $('#' + videoId).width();
        var h = $('#' + videoId).height();
        var h1 = parseInt(w / 16.0 * 9.0);
        if (h1 < h) {
            $('#' + videoId).css('height', '' + h1 + 'px');
            $('#' + videoId).css('margin-top', '' + ((h - h1) / 2) + 'px');
        }
        else if (h1 > h) {
            var w1 = parseInt(h / 9.0 * 16.0);
            $('#' + videoId).css('width', '' + w1 + 'px');
            $('#' + videoId).css('margin-left', '' + ((w - w1) / 2) + 'px');
        }
    }
    else if (eventName == "主码流") {
        if (parent.videoSwitchBitstream) parent.videoSwitchBitstream(id, 0);
    }
    else if (eventName == "子码流") {
        if (parent.videoSwitchBitstream) parent.videoSwitchBitstream(id, 1);
    }
    else if (eventName == "字幕开") {
        if (parent.videoSwitchSubtitle) parent.videoSwitchSubtitle(id, 1);
    }
    else if (eventName == "字幕关") {
        if (parent.videoSwitchSubtitle) parent.videoSwitchSubtitle(id, 0);
    }
    else if (eventName == "正常") { // videoPlaybackControl(controlMode, multiples, dragPosition, callback)
        if (parent.videoPlaybackControl) parent.videoPlaybackControl(0, 0, null);
    }
    else if (eventName == "暂停") {
        if (parent.videoPlaybackControl) parent.videoPlaybackControl(1, 0, null);
    }
    else if (eventName == "结束") {
        if (parent.videoPlaybackControl) parent.videoPlaybackControl(2, 0, null);
    }
    else if (eventName == "关键帧") {
        if (parent.videoPlaybackControl) parent.videoPlaybackControl(6, 0, null);
    }
    else if (eventName == "快进X1") {
        if (parent.videoPlaybackControl) parent.videoPlaybackControl(3, 1, null);
    }
    else if (eventName == "快进X2") {
        if (parent.videoPlaybackControl) parent.videoPlaybackControl(3, 2, null);
    }
    else if (eventName == "快进X4") {
        if (parent.videoPlaybackControl) parent.videoPlaybackControl(3, 3, null);
    }
    else if (eventName == "快进X8") {
        if (parent.videoPlaybackControl) parent.videoPlaybackControl(3, 4, null);
    }
    else if (eventName == "快进X16") {
        if (parent.videoPlaybackControl) parent.videoPlaybackControl(3, 5, null);
    }
    else if (eventName == "关键帧快退X1") {
        if (parent.videoPlaybackControl) parent.videoPlaybackControl(4, 1, null);
    }
    else if (eventName == "关键帧快退X2") {
        if (parent.videoPlaybackControl) parent.videoPlaybackControl(4, 2, null);
    }
    else if (eventName == "关键帧快退X4") {
        if (parent.videoPlaybackControl) parent.videoPlaybackControl(4, 3, null);
    }
    else if (eventName == "关键帧快退X8") {
        if (parent.videoPlaybackControl) parent.videoPlaybackControl(4, 4, null);
    }
    else if (eventName == "关键帧快退X16") {
        if (parent.videoPlaybackControl) parent.videoPlaybackControl(4, 5, null);
    }

    $(this).parent().parent().parent().find('.vjs-control-text-value').html(eventName);
    $('.vjs-control-menu').removeClass('vjs-conrol-menu-popup');
    $('.video-js').find('.vjs-control-bar').fadeOut();
}

function openSetting() {
    dlgSetting = layui.layer.open({ type: 1, title: "设置...", content: $('#divEditDialog'), area: ['400px'], cancel: function () { $('#divEditDialog').hide(); } });
    layui.layer.full(dlgSetting);
}

// 停止播放功能（这里直接关掉，并调用父窗口方法）
function stopVideo() {
    videoDispose();
    if (parent.stopVideo) parent.stopVideo(id);
}

function videoDispose() {
    if (this.jvp) this.jvp.destroy();
    this.jvp = undefined;
}

// 全屏功能实现
function toggleFullScreen() {
    if ($('.video-js').hasClass("vjs-fullscreen")) {
        exitFullScreen();
    } else {
        requestFullScreen();
    }
}

function toggleFullScreenClass() {
    if ($('.video-js').hasClass("vjs-fullscreen")) {
        $('.video-js').removeClass("vjs-fullscreen");
    } else {
        $('.video-js').addClass("vjs-fullscreen");
    }
}

function screenShot() {
    // 获取年月日作为文件名
    var timers = new Date();
    var fullYear = timers.getFullYear();
    var month = timers.getMonth() + 1;
    var date = timers.getDate();
    var randoms = Math.random() + '';
    var filename = vehicleNumber + '[' + channelId + ']' + fullYear + '' + month + date + randoms.slice(3, 10) + '.png';

    var video = document.getElementById(videoId);
    var canvas = document.getElementById(id + '_canvas');
    var ctx = canvas.getContext('2d');
    if (ctx && video) {
        var w = $('#' + videoId).width();
        var h = $('#' + videoId).height();
        canvas.width = w;
        canvas.height = h;

        ctx.drawImage(video, 0, 0, w, h);  // 将video中的数据绘制到canvas里
        saveImage(canvas, filename);  // 存储图片到本地
        canvas.width = 0;
        canvas.height = 0;
    }
}

function saveImage(canvas, filename) {
    var image = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    saveFile(image, filename || 'file_' + new Date().getTime() + '.png');
}

function saveFile(data, filename) {
    var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
    save_link.href = data;
    save_link.download = filename;

    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    save_link.dispatchEvent(event);
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// 音量拖动功能实现
var volumeBarDiv = $('.vjs-volume-level').parent().get(0);
 

var volumeLevelDiv = $('.vjs-volume-level').get(0);
var volumeLevelMax = $('.vjs-volume-level').parent().height() - 10;
var volumeLevelValue = 0;
var volumeLevelIsDown = false;
var volumeLevelY = 0;
var volumeLevelT = 0;

function setUIVolumeValue(volume) {
	
	console.dir($('.vjs-volume-level'));
	
    if (volume < 0) volume = 0;
    if (volume > volumeLevelMax) volume = volumeLevelMax;
    volumeLevelValue = volume;
    // volumeLevelDiv.style.top = volume + 'px';

    var actVolume = 100 - parseInt(volume / volumeLevelMax * 100);
    this.setActualVolumeValue(actVolume);
}

function setActualVolumeValue(actVolume) {
    $('.vjs-volume-bar').attr('aria-valuenow', actVolume);

    $('.vjs-button-volume-menu').removeClass("vjs-vol-0");
    $('.vjs-button-volume-menu').removeClass("vjs-vol-1");
    $('.vjs-button-volume-menu').removeClass("vjs-vol-2");
    if (actVolume == 0) $('.vjs-button-volume-menu').addClass("vjs-vol-0");
    if (actVolume <= 33 && actVolume > 0) $('.vjs-button-volume-menu').addClass("vjs-vol-1");
    if (actVolume <= 66 && actVolume > 33) $('.vjs-button-volume-menu').addClass("vjs-vol-2");

    document.getElementById(videoId).volume = actVolume / 100.0;

    //if (beforeVolume <= 0.0 && actVolume > 0.0 && parent.openAudio) parent.openAudio(id);
    //if (actVolume <= 0.0 && parent.closeAudio) parent.closeAudio(id);
    beforeVolume = actVolume;
}

// 静音/开启声音
function toggleActualVolumeMute(e) {
    if ($(e.target).hasClass('vjs-volume-bar')) return;
    if ($(e.target).hasClass('vjs-volume-level')) return;
    if ($(e.target).hasClass('vjs-menu-content')) return;
    if ($('.vjs-button-volume-menu').hasClass("vjs-vol-0")) {
        setUIVolumeValue(0);
    } else {
        setUIVolumeValue(volumeLevelMax);
    }
}

volumeBarDiv?volumeBarDiv.onclick = function (e) {
    if ($(e.target).hasClass('vjs-volume-bar')) {
        var nt = e.offsetY;
        setUIVolumeValue(nt);
    }
}:"";

// 滑动有BUG，暂不启用
////volumeLevelDiv.onmousedown = function (e) {
////    if ($(e.target).hasClass('vjs-volume-bar')) return;
////    if ($(e.target).hasClass('vjs-menu-content')) return;

////    //获取x坐标和y坐标、左部和顶部的偏移量
////    volumeLevelY = e.clientY;
////    volumeLevelT = volumeLevelDiv.offsetTop;

////    //开关打开
////    volumeLevelIsDown = true;
////}

////volumeLevelDiv.onmousemove = function (e) {
////    if ($(e.target).hasClass('vjs-volume-bar')) return;
////    if ($(e.target).hasClass('vjs-menu-content')) return;
////    if (volumeLevelIsDown == false) return;

////    //计算移动后的左偏移量和顶部的偏移量
////    var ny = e.clientY;
////    var nt = ny - (volumeLevelY - volumeLevelT);
////    setUIVolumeValue(nt);
////}

////volumeLevelDiv.onmouseup = function (e) {
////    volumeLevelIsDown = false;
////}
