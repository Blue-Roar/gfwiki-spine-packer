# 少前百科战术人形骨骼数据打包下载 #

用于从 GFWiki 或 IOP Wiki 打包下载战术人形骨骼数据的脚本

----------

## 使用方法 ##
两种方式任选其一，脚本加载完毕后在战术人形（Q版人形）预览区域会出现**下载当前皮肤**按钮。
【进阶操作】亦可通过控制台`packSpine(<战术人形名称>,<皮肤编号>)`调用（请注意 IOP Wiki 的战术人形名称与皮肤编号与原始ID不一致）
#### 独立运行 ####
将**script.js**的内容粘贴到打开了 GFWiki 或 IOP Wiki 页面的浏览器控制台执行
#### 油猴脚本 ####
https://greasyfork.org/zh-CN/scripts/500067

## 注意事项 ##
IOP Wiki 的战术人形数据文件名与实际ID不一致，目前脚本并不支持修改，需要手动查看.atlas内的具体ID并修改文件名。以特工416的曼岛之盾皮肤为例，其在IOP Wiki的文件名为`agent_416_costume1`而实际ID为`hk416agent_546`，则需要将`agent_416_costume1.png`文件名修改为`hk416agent_546.png`，**目录下所有文件都需要修改**。在替换时需要留意文件名以r开头的宿舍状态数据文件，`ragent_416_costume1.atlas`替换为`rhk416agent_546.atlas`，“r”不能遗漏或错位。
