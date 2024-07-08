// 引用必要的打包库
$('head').append('<script src="https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/jquery/3.6.0/jquery.min.js" crossorigin="anonymous"></script>');
$('head').append('<script src="https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/jszip/3.2.2/jszip.min.js" type="application/javascript" crossorigin="anonymous"></script>');
$('head').append('<script src="https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/jszip-utils/0.1.0/jszip-utils.min.js" type="application/javascript" crossorigin="anonymous"></script>');
$('head').append('<script src="https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/FileSaver.js/1.3.8/FileSaver.min.js" type="application/javascript" crossorigin="anonymous"></script>');
$('.gf-droplist.chibi-costume-switcher').after('<button onclick="packSpine()" style="position:absolute;top:34px;right:5px;width:135px;height:30px;background-color:#222;color:#eaeaea;z-index:1;border-radius:5px;cursor:pointer;">下载当前皮肤</button>');

let cpp = window.gfUtils.createWikiPathPart;
function getChibiFiles(costumeId) {
    let tryFiles = [
        (costumeId + "_chibi_spritemap.png"),
        (costumeId + "_chibi_skel.skel"),
        (costumeId + "_chibi_atlas.txt"),
        (costumeId + "_chibi_dorm_spritemap.png"),
        (costumeId + "_chibi_dorm_skel.skel"),
        (costumeId + "_chibi_dorm_atlas.txt")
    ];
    let files = [];

    for (let i=tryFiles.length-1;i>=0;i--) {
        let fileName = tryFiles[i];
        let fileUrl = 'https://gfwiki.org/images/' + cpp(fileName) + fileName;
        $.ajax({
            url:fileUrl,
            type:'HEAD',
            success: function() {
                files.push(fileName);
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

function packSpine() {
    let tdollId = $('#TDollChibiAnimation').attr('data-tdoll-id');
    let tdollCostume = $('#TDollChibiAnimation').attr('data-tdoll-costume');
    let name = tdollId+tdollCostume;
    let files = getChibiFiles(name);
    
    let checkTimer = setTimeout(function() {
        if (files) {
            clearTimeout(checkTimer);
            console.log("文件：",files);
            let zip = new JSZip();
            let spine = zip.folder(name.toLowerCase());
            
            $.each(files, function(index, value) {
                let fileName = value; //files[index];
                console.log(fileName);
                let fileUrl = 'https://gfwiki.org/images/' + cpp(fileName) + fileName;
                fileName = fileName.replace('_chibi','');
                fileName = fileName.replace('_spritemap.png','.png');
                fileName = fileName.replace('_skel.skel','.skel');
                fileName = fileName.replace('_atlas.txt','.atlas');
                if (fileName.includes('_dorm')) {
                    fileName = fileName.replace('_dorm','');
                    fileName = 'r'+fileName;
                }
                name = name.toLowerCase();
                fileName = fileName.toLowerCase();
                console.log(name,fileUrl);
                let fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1);
                if (fileExtension == "atlas") {
                    var promise = $.get(fileUrl);
                    spine.file(fileName, promise, {compression: "DEFLATE", compressionOptions: {level: 9}});
                } else {
                    spine.file(fileName, urlToPromise(fileUrl), {binary:true});
                }
            });
            
            zip.generateAsync({type:"blob", compression: "DEFLATE", compressionOptions: {level: 9}}).then(function(content) {
                saveAs(content, name + ".zip");
            });
        }
    }, 1000);
}