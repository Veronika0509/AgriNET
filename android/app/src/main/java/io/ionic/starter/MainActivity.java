package io.ionic.starter;

import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.GeolocationPermissions;
import android.webkit.WebChromeClient;
import android.widget.FrameLayout;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private View customView;
    private WebChromeClient.CustomViewCallback customViewCallback;
    private int originalSystemUiVisibility;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Handle geolocation permissions and fullscreen for Google Maps in WebView
        this.bridge.getWebView().setWebChromeClient(new WebChromeClient() {
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                callback.invoke(origin, true, false);
            }

            @Override
            public void onShowCustomView(View view, CustomViewCallback callback) {
                // If a custom view already exists, hide it
                if (customView != null) {
                    onHideCustomView();
                    return;
                }

                // Store the custom view and callback
                customView = view;
                customViewCallback = callback;

                // Store original UI visibility
                originalSystemUiVisibility = getWindow().getDecorView().getSystemUiVisibility();

                // Hide system UI for fullscreen
                getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_FULLSCREEN |
                    View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                );

                // Add custom view to the view hierarchy
                FrameLayout decorView = (FrameLayout) getWindow().getDecorView();
                decorView.addView(customView, new FrameLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                ));
            }

            @Override
            public void onHideCustomView() {
                // Remove custom view from the view hierarchy
                FrameLayout decorView = (FrameLayout) getWindow().getDecorView();
                decorView.removeView(customView);
                customView = null;

                // Restore original UI visibility
                getWindow().getDecorView().setSystemUiVisibility(originalSystemUiVisibility);

                // Notify the callback
                if (customViewCallback != null) {
                    customViewCallback.onCustomViewHidden();
                    customViewCallback = null;
                }
            }
        });
    }

    @Override
    public void onBackPressed() {
        // Handle back button when in fullscreen
        if (customView != null) {
            this.bridge.getWebView().getWebChromeClient().onHideCustomView();
        } else {
            super.onBackPressed();
        }
    }
}
