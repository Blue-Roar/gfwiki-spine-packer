// ==UserScript==
// @name         少前百科 GFWiki 战术人形骨骼数据打包下载
// @namespace    https://github.com/Blue-Roar/gfwiki-spine-packer
// @version      1.0
// @description  打包下载少前百科 GFWiki / IOP Wiki 上的战术人形骨骼数据
// @author       BrightSu
// @license      gpl-3.0
// @match        *://gfwiki.org/*
// @match        *://iopwiki.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=iopwiki.com
// @grant        none
// @run-at       document-idle
// @require      https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/jquery/3.6.0/jquery.min.js
// @require      https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/jszip/3.2.2/jszip.min.js
// @require      https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/jszip-utils/0.1.0/jszip-utils.min.js
// @require      https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/FileSaver.js/1.3.8/FileSaver.min.js
// @unwrap
// ==/UserScript==

// 引用必要的库
$('head').append('<script src="https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/jquery/3.6.0/jquery.min.js" crossorigin="anonymous"></script>');
$('head').append('<script src="https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/jszip/3.2.2/jszip.min.js" type="application/javascript" crossorigin="anonymous"></script>');
$('head').append('<script src="https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/jszip-utils/0.1.0/jszip-utils.min.js" type="application/javascript" crossorigin="anonymous"></script>');
$('head').append('<script src="https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/FileSaver.js/1.3.8/FileSaver.min.js" type="application/javascript" crossorigin="anonymous"></script>');

if (window.location.host == "iopwiki.com") $('.gf-droplist.chibi-costume-switcher').after('<button onclick="packSpine()" style="width:135px;height:24px;background-color:#222;color:#eaeaea;border-radius:5px;cursor:pointer;">下载当前皮肤</button>');
if (window.location.host == "gfwiki.org") $('.chibiAnimationSelect.chibiButton').after('<button onclick="packSpine()" style="width:135px;height:24px;background-color:#222;color:#eaeaea;border-radius:5px;cursor:pointer;">下载当前皮肤</button>');

var filesLoaded = false;
function getChibiFiles(costumeId) {
    let cpp = window.gfUtils.createWikiPathPart;
    let tryFiles = [
        (costumeId + "_chibi_spritemap.png"),
        (costumeId + "_chibi_skel.skel"),
        (costumeId + "_chibi_atlas.txt"),
        (costumeId + "_chibi_dorm_spritemap.png"),
        (costumeId + "_chibi_dorm_skel.skel"),
        (costumeId + "_chibi_dorm_atlas.txt")
    ];
    let files = [];
    filesLoaded = false;
    for (let i=tryFiles.length-1;i>=0;i--) {
        let fileName = tryFiles[i];
        let fileUrl = '/images/' + cpp(fileName) + fileName;
        $.ajax({
            url:fileUrl,
            type:'HEAD',
            success: function() {
                files.push(fileName);
            },
            complete: function() {
                if (i == tryFiles.length-1) {
                    filesLoaded = true;
                }
            }
        });
    }
    return files;
}

function urlToPromise(url) {
    return new Promise(function(resolve, reject) {
        JSZipUtils.getBinaryContent(url, function (err, data) {
            if(err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

function packSpine(tdollId = null, tdollCostume = null) {
    if (window.location.host == "iopwiki.com") {
        if (!tdollId) tdollId = $('#enemyChibiAnimation').attr('data-tdoll-id');
        if (!tdollCostume) tdollCostume = $('#enemyChibiAnimation').attr('data-tdoll-costume');
    } else if (window.location.host == "gfwiki.org") {
        if (!tdollId) tdollId = $('#TDollChibiAnimation').attr('data-tdoll-id');
        if (!tdollCostume) tdollCostume = $('#TDollChibiAnimation').attr('data-tdoll-costume');
    }

    let cpp = window.gfUtils.createWikiPathPart;
    let costumeId = tdollId+tdollCostume;
    let files = getChibiFiles(costumeId);
    
    // “异步”（然而并没能实现）
    // 总之是为了检查文件列表是否获取完毕
    let checkTimer = setTimeout(function() {
        if (filesLoaded) {
            clearTimeout(checkTimer);
            console.log("文件：",files);
            let zip = new JSZip();
            let spine = zip.folder(costumeId.toLowerCase());
            
            $.each(files, function(index, value) {
                let fileName = value; //files[index];
                let fileUrl = '/images/' + cpp(fileName) + fileName;
                fileName = fileName.replace('_chibi','');
                fileName = fileName.replace('_spritemap.png','.png');
                fileName = fileName.replace('_skel.skel','.skel');
                fileName = fileName.replace('_atlas.txt','.atlas');
                if (fileName.includes('_dorm')) {
                    fileName = fileName.replace('_dorm','');
                    fileName = 'r'+fileName;
                }
                costumeId = costumeId.toLowerCase();
                fileName = fileName.toLowerCase();
                let fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1);
                if (fileExtension == "atlas") {
                    var promise = $.get(fileUrl);
                    spine.file(fileName, promise, {compression: "DEFLATE", compressionOptions: {level: 9}});
                } else {
                    spine.file(fileName, urlToPromise(fileUrl), {binary:true});
                }
            });
            
            if (window.location.host == "iopwiki.com") zip.file("注意.txt", "IOP Wiki 的战术人形数据文件名与原始文件名往往不一致，并且此脚本当前并不支持修改。请手动查看"+costumeId+".atlas内的具体ID并修改文件名", {compression: "DEFLATE", compressionOptions: {level: 9}});

            zip.generateAsync({type:"blob", compression: "DEFLATE", compressionOptions: {level: 9}}).then(function(content) {
                saveAs(content, costumeId + ".zip");
            });
        }
    }, 1000);
}