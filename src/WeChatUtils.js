import * as WeChat from 'react-native-wechat';
/*微信分享
 *title:分享的标题
 *description:分享的标题内容
 *thumbImage 分享的图片地址
 *webpageUrl 分享的链接地址
 *type:1分享到朋友圈，2分享到好友 默认分享到朋友圈
*/
export function shareToWechat(data){
    let title = data.title
    let description =data.description
    let thumbImage= data.thumbImage
    let webpageUrl =data.webpageUrl
    let type= data.type
    WeChat.isWXAppInstalled()
    .then((isInstalled) => {
        if (isInstalled) {
            if(type ==='2'){
                //微信好友
                WeChat.shareToSession({
                    title:title,
                    description: description,
                    thumbImage: thumbImage,
                    type: 'news',
                    webpageUrl: webpageUrl
                }).catch((error) => {
                    ToastToUser(error.message)
                });
            }else{
                //微信朋友圈
                WeChat.shareToTimeline({
                    title:title,
                    description: description,
                    thumbImage: thumbImage,
                    type: 'news',
                    webpageUrl: webpageUrl
                }).catch((error) => {
                    ToastToUser(error.message)
                });
            }
        } else {
            ToastToUser('请先安装微信')
        }
});

 
};

//微信初始化
export function registerApp(){
    try {
        WeChat.registerApp('wx27a42a7ddd0fd6f8');
        } catch (e) {
    }
}