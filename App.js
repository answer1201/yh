/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {
  Component,
} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  PermissionsAndroid,
  Animated,
  ImageBackground,
  default as Easing,
  Vibration,
  ToastAndroid,
  Platform,
  BackAndroid,
  BackHandler
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

import {shareToWechat,registerApp} from './src/WeChatUtils'
import Contacts from 'react-native-contacts';

import { RNCamera } from 'react-native-camera'

import AndroidModule from './src/AndroidConnent'

import { WebView } from 'react-native-webview';

import ImagePicker from 'react-native-image-picker'
var photoOptions = {
  //底部弹出框选项
  title: '请选择',
  cancelButtonTitle: '取消',
  takePhotoButtonTitle: '拍照',
  chooseFromLibraryButtonTitle: '选择相册',
  quality: 0.75,
  allowsEditing: true,
  noData: false,
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
}

//分享的内容
const obj = {
  "title": "分享的标题",
  "description": "分享的标题内容",
  "thumbImage": "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1596535383509&di=23df6553f8d773bf33413ef6421c57f4&imgtype=0&src=http%3A%2F%2Fbenyouhuifile.it168.com%2Fforum%2Fmonth_0807%2F20080725_7b6f50b7a39f9a971396f4nZCcNoQ5o0.jpg", 
  "webpageUrl": "http://www.baidu.com",
}

var WEB_VIEW_REF = 'webview';


const source ={uri: 'file:///android_asset/page/index.html'}


class App extends React.Component{

  constructor(props){
    super(props)
    this.state = {
        showScan:false,
        alreadyShowScan:false,
        scanResult:'',
        availableDes:'',
        baiduMap:false,
        geoMap:false,
        moveAnim: new Animated.Value(-2),
        imgURL:'',
        backButtonEnabled:false,
        clickType:''
    };

}

  componentDidMount() {
     BackHandler.addEventListener('hardwareBackPress',this.onBackAndroid.bind(this));
    //微信初始化
    registerApp();
  }
  componentWillUnmount(){
    BackHandler.removeEventListener('hardwareBackPress',this.onBackAndroid.bind(this))
  }

  render(){
     if(this.state.showScan){
        return(
          <RNCamera
            style={styles.preview}
            type={RNCamera.Constants.Type.back}
            googleVisionBarcodeType={RNCamera.Constants.GoogleVisionBarcodeDetection.BarcodeType.QR_CODE}
            flashMode={RNCamera.Constants.FlashMode.auto}
            onBarCodeRead={(e) => this.barcodeReceived(e)}
            autoFocus={RNCamera.Constants.AutoFocus.on}>
              <View style={{width:500,height:220,backgroundColor: 'rgba(0,0,0,0.5)',}}/>
                    <View style={[{flexDirection:'row'}]}>
                        <View style={{backgroundColor: 'rgba(0,0,0,0.5)',height:200,width:200}}/>
                        <ImageBackground source={require('./res/qrcode_bg.png')} style={{width:200,height:200}}>
                            <Animated.View style={[styles.border,{transform: [{translateY: this.state.moveAnim}]}]}/>
                        </ImageBackground>
                    <View style={{backgroundColor: 'rgba(0,0,0,0.5)',height:200,width:200}}/>
              </View>
              <View style={{flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', width: 500, alignItems: 'center'}}>
                  <Text style={styles.rectangleText}>将二维码放入框内，即可自动扫描</Text>
              </View>
          </RNCamera>
      ) 
    }else{
        console.log(source)
        return(
          <View style={{flex:1}}>
              <StatusBar backgroundColor="#ff0000"
                           translucent={true}
                           hidden={true}
                           animated={true}/>
                           
          <WebView 
          style={{flex:1}}
          originWhitelist={['*']}
          source={{ html: `
          <html lang="zh">
          <head>
              <meta charset="UTF-8">
              <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
              <meta name="renderer" content="webkit">
              <meta http-equiv="Cache-Control" content="no-siteapp">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <link rel="stylesheet" href="./build/calendar.css">
              <style>
                  .btn{
                      background: #f00;color:#fff
                  }
              </style>
          </head>
          <body style="background:#ddd;">

          
              <div style="text-align: center;margin-top:15px">
                  <button id="button" onclick="send(1)">微信朋友圈分享</button>
              </div>
     
              <div style="text-align: center;margin-top:15px;">
                  <button id="button" onclick="send(2)">微信好友分享</button>
              </div>

              <div style="text-align: center;margin-top:15px">
                 <button id="button" onclick="send(3)">扫一扫</button>
                 <p style="text-align: center;font-size:11pt">扫描结果: <span id="sacnResult"></span></p>
              </div>

              <div style="text-align: center;margin-top:50px;">
                  <button id="button" onclick="send(4)">获取通讯录</button>
         
              </div>

              <div style="text-align: center;margin-top:20px;">
                  <button id="button" onclick="send(5)">拍照</button>
                  <p style="text-align: center;font-size:11pt"">图片地址: <span id="photoUrl"></span></p>
              </div>

              <div style="text-align: center;margin-top:40px;">
                  <button id="button" onclick="send(6)">手机震动</button>
              </div>

              <div style="text-align: center;margin-top:30px;">
                  <button id="button" onclick="send(7)">是否安装百度,高德地图</button>
                  <p style="text-align: center">结果: <span id="available"></span></p>
              </div>

              <div style="text-align: center;margin-top:20px;">
                  <button id="button" onclick="send(8)">地图导航</button>
              </div>

              <div style="text-align: center;margin-top:20px;">
                <button id="button" onclick="send(9)">指纹识别</button>
              </div>

          </body>
          <script>
              function send (temp) {
                  window.ReactNativeWebView.postMessage(temp);
              }
              window.onload = function () {
                  document.addEventListener('message', function (e) {
                      if(e.data.split('&')[0] == '3'){
                        document.getElementById('sacnResult').textContent = e.data.split('&')[1];
                      }else if(e.data.split('&')[0] == '4'){
                        document.getElementById('contacts').textContent = '获取成功查看日志';
                      }else if(e.data.split('&')[0] == '5'){
                        document.getElementById('photoUrl').textContent =e.data.split('&')[1];
                      }else if(e.data.split('&')[0] == '7'){
                        document.getElementById('available').textContent =e.data.split('&')[1];
                      }
                    
                  });
              }
          </script>
          </html>
          ` }}
             onMessage={this.onWebViewMessage}
             ref={WEB_VIEW_REF}
             onNavigationStateChange={this.onNavigationStateChange}
             javaScriptEnabled={true}
             androiddomStorageEnabled={false}
             domStorageEnabled={true}
             allowFileAccessFromFileURLs={true}
             geolocationEnabled={true}
             javaScriptCanOpenWindowsAutomatically={true}
             cacheEnabled={true}
          />
        </View>
        )
      
      // return(
      //   <>
      //   <StatusBar barStyle="dark-content" />
      //   <SafeAreaView>
          
      //       <View>
      //          {/* 微信好友分享 */}
      //         <TouchableOpacity 
      //             onPress={this.shareToFriend.bind(this,'2')}>
      //           <View style={styles.category}>
      //               <Text style={styles.title}>微信好友分享</Text>
      //           </View>
      //         </TouchableOpacity>
  
      //         {/* 微信朋友圈分享 */}
      //         <TouchableOpacity 
      //             onPress={this.shareToFriend.bind(this,'1')}>
      //           <View style={styles.category}>
      //               <Text style={styles.title}>微信朋友圈分享</Text>
      //           </View>
      //         </TouchableOpacity>
  
      //         {/* 扫一扫 */}
      //         <TouchableOpacity 
      //             onPress={this.qrscan.bind(this)}>
      //           <View style={styles.category}>
      //               <Text style={styles.title}>扫一扫<Text style={styles.titleResult}>{this.state.scanResult}</Text></Text>
      //           </View>
      //         </TouchableOpacity>

      //             {/* 获取通讯录 */}
      //         <TouchableOpacity 
      //             onPress={this.getcontacts.bind(this)}>
      //           <View style={styles.category}>
      //               <Text style={styles.title}>获取通讯录</Text>
      //           </View>
      //         </TouchableOpacity>

      //             {/* 拍照 */}
      //         <TouchableOpacity 
      //             onPress={this.photograph.bind(this)}>
      //           <View style={styles.category}>
      //               <Text style={styles.title}>拍照</Text>
      //           </View>
      //         </TouchableOpacity>

      //           {/* 手机震动 */}
      //         <TouchableOpacity 
      //             onPress={this.vibration.bind(this)}>
      //           <View style={styles.category}>
      //               <Text style={styles.title}>手机震动</Text>
      //           </View>
      //         </TouchableOpacity>

      //              {/* 是否安装百度,高德地图 */}
      //         <TouchableOpacity 
      //             onPress={this.isAvilible.bind(this)}>
      //           <View style={styles.category}>
      //               <Text style={styles.title}>是否安装百度,高德地图<Text style={styles.titleResult}>{this.state.availableDes}</Text></Text>
      //           </View>
      //         </TouchableOpacity>

      //         {/* 开始导航 */}
      //         <TouchableOpacity 
      //             onPress={this.startMap.bind(this)}>
      //           <View style={styles.category}>
      //               <Text style={styles.title}>开始导航</Text>
      //           </View>
      //         </TouchableOpacity>

      //       </View>
            
      //   </SafeAreaView>
      //   </>
      // )
    }

  }

  onWebViewMessage = (event) => {
    this.setState({
      clickType:event.nativeEvent.data
    })
    if(event.nativeEvent.data == '1' || event.nativeEvent.data == '2'){
      obj.type=event.nativeEvent.data
      shareToWechat(obj)
    }else if(event.nativeEvent.data == '3'){
      this.qrscan() 
    }else if(event.nativeEvent.data == '4'){
      this.getcontacts() 
    }else if(event.nativeEvent.data == '5'){
      this.photograph() 
    }else if(event.nativeEvent.data == '6'){
      this.vibration() 
    }else if(event.nativeEvent.data == '7'){
      this.isAvilible() 
    }else if(event.nativeEvent.data == '8'){
      this.startMap() 
    }else if(event.nativeEvent.data == '9'){
      this.requestFingerprintPermission()
    
    }
  }

  //微信分享
  shareToFriend(type){
     obj.type=type
     shareToWechat(obj)
  }

  //扫一扫
  qrscan(){
    this.requestCameraPermission(1);
  }

  //请求拍照权限的方法
  async requestCameraPermission(type) {
    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
                title: '申请摄像头权限',
                message:
                    '获取一下拍照的权限',
                buttonNegative: '不行',
                buttonPositive: '好吧',
            },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('现在你获得摄像头权限了');
            if(type == 1){
              //扫描
              if(!this.state.alreadyShowScan){
                this.startAnimation();
              }
              this.setState({
                showScan:true,
                alreadyShowScan:true
              })

            }else{
              //拍照
              this.cameraAction();
            }
           
        } else {
            console.log('用户拒绝了权限');
        }
    } catch (err) {
        console.warn(err);
    }
}

barcodeReceived = (result) => {
  this.setState({
    showScan:false
  })
  //扫码后返回的结果数据
  // this.setState({
  //   scanResult:result.data
  // })
  setTimeout(
    () => {
      let data=this.state.clickType+'&'+result.data
      this.refs[WEB_VIEW_REF].postMessage(data);
     },
    1000 
);

};

  /** 扫描框动画*/
  startAnimation = () => {
    this.state.moveAnim.setValue(-2);
    Animated.sequence([
        Animated.timing(
            this.state.moveAnim,
            {
                toValue: 200,
                duration: 2500,
                easing: Easing.linear
            }
        ),
        Animated.timing(
            this.state.moveAnim,
            {
                toValue: -1,
                duration: 2500,
                easing: Easing.linear
            }
        )
    ]).start(() => this.startAnimation())

};

//获取通讯录
getcontacts(){
  this.requestContactPermission();
}

  //请求获取通讯录的方法
  async requestContactPermission() {
    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
            {
                title: '申请获取通讯录权限',
                message:
                    '获取一下通讯录的权限',
                buttonNegative: '不行',
                buttonPositive: '好吧',
            },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('现在你获得通讯录权限了');
            this.getAllContacts()
        } else {
            console.log('用户拒绝了权限');
        }
    } catch (err) {
        console.warn(err);
    }
}
//获取全部联系人
getAllContacts(){
  let self = this;
  Contacts.getAll((err, contacts) => {
  if (err) throw err;
    //通讯录
    console.log(contacts)
    let data=this.state.clickType+'&'+contacts
    this.refs[WEB_VIEW_REF].postMessage(data);
  })
}

//拍照
photograph(){
  this.requestCameraPermission(2);
}

cameraAction(){
  ImagePicker.launchCamera(photoOptions, (response) => {
    if (response.didCancel) {
      return
    }
    //获得的图片地址
    console.log(response.uri)
    let data=this.state.clickType+'&'+response.uri
    this.refs[WEB_VIEW_REF].postMessage(data);
  })
}

 //点击震动
 vibration() {
  Vibration.vibrate([0, 1000, 500, 1000],false)
}

//是否安装了百度和高德地图
isAvilible(){
      AndroidModule.isAvilible((result)=>{
      let reg=result.split('&')
      console.log(result)
      let temp=''
       if(reg[0]== 'true'){
          temp='安装了百度导航,'
          this.setState({
            baiduMap:true
          })
       }else{
         temp='没有安装百度导航,'
         this.setState({
          baiduMap:false
        })
       }
       if(reg[1] == 'true'){
        temp+='安装了高德导航'
        this.setState({
          geoMap:true
        })
     }else{
       temp+='没有安装高德导航'
       this.setState({
        geoMap:false
      })
     }

     let data=this.state.clickType+'&'+temp
     this.refs[WEB_VIEW_REF].postMessage(data);

     this.setState({
       availableDes:temp
     })

      });
}

startMap(){
  this.isAvilible();
  setTimeout(
    () => {
      if(!this.state.baiduMap && !this.state.geoMap){
        ToastAndroid.show("百度和高德地图都没有安装哦", ToastAndroid.SHORT);
      }
      let obj={
        destLat:'30.231552',
        destLng:'120.149742'
      } 
      if(this.state.baiduMap){
        AndroidModule.openNavMap('com.baidu.BaiduMap',obj)
      }else if(this.state.geoMap){
        AndroidModule.openNavMap('com.autonavi.minimap',obj)
      }
     },
    1000 
);
 
}

async requestFingerprintPermission(){
  
 AndroidModule.supportFingerprint((result)=>{
    if(result == '1'){
        console.log('识别成功了')
    }
}
)
    

}



onBackAndroid(){
  if (this.state.backButtonEnabled) {
      this.refs[WEB_VIEW_REF].goBack();
      return true;
  } else {
      return false;
  }
};

onNavigationStateChange = (navState)=> {
  this.setState({
      backButtonEnabled: navState.canGoBack,
  });
};
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  category:{
    height:70,
    justifyContent:'center',
    alignItems:'center',
    borderBottomWidth:1,
    borderBottomColor:'#e1e1e1'
  },
  title:{
    fontSize:16,
    color:'#333333',
    fontWeight:'bold'

  },

  titleResult:{
    fontSize:13,
    marginLeft:15,
    color:'#ff6600',
  },

  container: {
    flex: 1,
    flexDirection: 'row'
},
preview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
},
rectangleContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
},
rectangle: {
    height: 200,
    width: 200,
    borderWidth: 1,
    borderColor: '#fcb602',
    backgroundColor: 'transparent',
    borderRadius:10,
},
rectangleText: {
    flex: 0,
    color: '#fff',
    marginTop: 10
},
border: {
    flex: 0,
    width: 196,
    height: 2,
    backgroundColor: '#fcb602',
    borderRadius: 50
}
  
});

export default App;
