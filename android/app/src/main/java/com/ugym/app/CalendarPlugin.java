package com.ugym.app;

import android.content.Intent;
import android.provider.CalendarContract;
import android.provider.CalendarContract.Events;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Calendar")
public class CalendarPlugin extends Plugin {
    @PluginMethod
    public void openInsert(PluginCall call) {
        String title = call.getString("title", "U-GYM");
        String location = call.getString("location", "");
        String description = call.getString("description", "");
        long start = call.getLong("start", System.currentTimeMillis());
        long end = call.getLong("end", start + 3600000L);

        try {
            Intent intent = new Intent(Intent.ACTION_INSERT);
            intent.setData(CalendarContract.Events.CONTENT_URI);
            intent.putExtra(Events.TITLE, title);
            intent.putExtra(Events.EVENT_LOCATION, location);
            intent.putExtra(Events.DESCRIPTION, description);
            intent.putExtra(CalendarContract.EXTRA_EVENT_BEGIN_TIME, start);
            intent.putExtra(CalendarContract.EXTRA_EVENT_END_TIME, end);
            getActivity().startActivity(intent);
            call.resolve(new JSObject().put("opened", true));
        } catch (Exception e) {
            call.reject("Impossibile aprire il calendario", e);
        }
    }
}
