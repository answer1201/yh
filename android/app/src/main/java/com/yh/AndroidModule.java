package com.yh;

import android.annotation.SuppressLint;
import android.annotation.TargetApi;
import android.app.Activity;
import android.app.KeyguardManager;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.hardware.fingerprint.FingerprintManager;
import android.net.Uri;
import android.os.Build;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.widget.Toast;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableNativeMap;

import org.json.JSONObject;

import java.security.KeyStore;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;

public class AndroidModule extends ReactContextBaseJavaModule implements ActivityEventListener {
    private Activity activity;

    public AndroidModule(ReactApplicationContext reactContext) {

        super(reactContext);
    }


    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {

    }

    @Override
    public void onNewIntent(Intent intent) {

    }

    @NonNull
    @Override
    public String getName() {
        return "AndroidModule";
    }

    @ReactMethod
    private void isAvilible(Callback callback) {
        Activity activity=null;
        activity=getCurrentActivity();
        if (activity == null) {
            return;
        }

        final PackageManager packageManager = activity.getPackageManager();
        List<PackageInfo> packageInfos = packageManager.getInstalledPackages(0);
        List<String> packageNames = new ArrayList<String>();
        if(packageInfos != null){
            for(int i = 0; i < packageInfos.size(); i++){
                String packName = packageInfos.get(i).packageName;
                packageNames.add(packName);
            }
        }
        boolean baidu = packageNames.contains("com.baidu.BaiduMap");
        boolean autonavi = packageNames.contains("com.autonavi.minimap");

        callback.invoke(baidu+"&"+autonavi);
    }



    @ReactMethod
    public void openNavMap(String pkgName,final ReadableMap msg) {

        try {

            ReadableNativeMap map = (ReadableNativeMap) msg;
            HashMap map2 = map.toHashMap();
//            String originLat = (String) map2.get("originLat");
//            String originLng = (String) map2.get("originLng");

            String destLat = (String) map2.get("destLat");
            String destLng = (String) map2.get("destLng");


//            if (isBlank(pkgName)) {
//                // http://lbsyun.baidu.com/index.php?title=uri/api/web
//                String url = "http://api.map.baidu.com/direction?origin=%s,%s&destination=%s,%s&region=%s&mode=driving&output=html&src=%s";
//                // 打开网页
//                Intent intent = new Intent();
//                intent.setAction("android.intent.action.VIEW");
//                Uri contentUrl = Uri.parse(String.format(url, originLat, originLng, destLat, destLng, this.getName(),
//                        this.getName()));
//                intent.setData(contentUrl);
//                this.getCurrentActivity().startActivity(intent);
//                return;
//            }


            String tmpName = pkgName.trim();
            if (tmpName.equals("com.baidu.BaiduMap")) {
                Intent i1 = new Intent();
                // 驾车导航
                i1.setData(Uri.parse(String.format("baidumap://map/navi?location=%s,%s", destLat, destLng)));
                this.getCurrentActivity().startActivity(i1);
            } else if (tmpName.equals("com.autonavi.minimap")) {
                // http://lbs.amap.com/api/amap-mobile/guide/android/navigation
                StringBuffer scheme = new StringBuffer("androidamap://navi?sourceApplication=").append(this.getName());
                // if (!TextUtils.isEmpty(poiname)){
                // stringBuffer.append("&poiname=").append(poiname);
                // }

                // dev 必填 是否偏移(0:lat 和 lon 是已经加密后的,不需要国测加密; 1:需要国测加密)
                // style 必填 导航方式(0 速度快; 1 费用少; 2 路程短; 3 不走高速；4 躲避拥堵；5
                // 不走高速且避免收费；6 不走高速且躲避拥堵；7 躲避收费和拥堵；8 不走高速躲避收费和拥堵))
                scheme.append("&lat=").append(destLat).append("&lon=").append(destLng).append("&dev=").append(0)
                        .append("&style=").append(0);

                Intent intent = new Intent("android.intent.action.VIEW", Uri.parse(scheme.toString()));
                intent.setPackage("com.autonavi.minimap");
                this.getCurrentActivity().startActivity(intent);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @ReactMethod
    @SuppressLint("MissingPermission")
    public void supportFingerprint(Callback callback) {
        Activity activity=null;
        activity=getCurrentActivity();
        if (activity == null) {
            return ;
        }

        if (Build.VERSION.SDK_INT < 23) {
            Toast.makeText(activity, "您的系统版本过低，不支持指纹功能", Toast.LENGTH_SHORT).show();
            return ;
        } else {
            KeyguardManager keyguardManager = activity.getSystemService(KeyguardManager.class);
            FingerprintManager fingerprintManager = activity.getSystemService(FingerprintManager.class);
            if (!fingerprintManager.isHardwareDetected()) {
                Toast.makeText(activity, "您的手机不支持指纹功能", Toast.LENGTH_SHORT).show();
                return ;
            } else if (!keyguardManager.isKeyguardSecure()) {
                Toast.makeText(activity, "您还未设置锁屏，请先设置锁屏并添加一个指纹", Toast.LENGTH_SHORT).show();
                return ;
            } else if (!fingerprintManager.hasEnrolledFingerprints()) {
                Toast.makeText(activity, "您至少需要在系统设置中添加一个指纹", Toast.LENGTH_SHORT).show();
                return ;
            }
        }
        initKey();
        initCipher(callback);
    }
    KeyStore keyStore;
    private static final String DEFAULT_KEY_NAME = "default_key";

    @TargetApi(23)
    private void initKey() {
        try {
            keyStore = KeyStore.getInstance("AndroidKeyStore");
            keyStore.load(null);
            KeyGenerator keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
            KeyGenParameterSpec.Builder builder = new KeyGenParameterSpec.Builder(DEFAULT_KEY_NAME,
                    KeyProperties.PURPOSE_ENCRYPT |
                            KeyProperties.PURPOSE_DECRYPT)
                    .setBlockModes(KeyProperties.BLOCK_MODE_CBC)
                    .setUserAuthenticationRequired(true)
                    .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_PKCS7);
            keyGenerator.init(builder.build());
            keyGenerator.generateKey();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @TargetApi(23)
    private void initCipher(Callback callback) {
        try {
            SecretKey key = (SecretKey) keyStore.getKey(DEFAULT_KEY_NAME, null);
            Cipher cipher = Cipher.getInstance(KeyProperties.KEY_ALGORITHM_AES + "/"
                    + KeyProperties.BLOCK_MODE_CBC + "/"
                    + KeyProperties.ENCRYPTION_PADDING_PKCS7);
            cipher.init(Cipher.ENCRYPT_MODE, key);
            showFingerPrintDialog(cipher,callback);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private void showFingerPrintDialog(Cipher cipher,Callback callback){
        Activity activity=null;
        activity=getCurrentActivity();
        if (activity == null) {
            return ;
        }
        FingerprintDialogFragment fragment = new FingerprintDialogFragment();
        fragment.setCipher(cipher,callback);
        fragment.show(activity.getFragmentManager(),"fingerprint");
    }



}
