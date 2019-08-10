package com.google.codeu.servlets;

import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.codeu.data.Datastore;
import com.google.codeu.data.Marker;
import com.google.gson.Gson;
import java.util.ArrayList;
import java.util.List;
import org.jsoup.Jsoup;
import org.jsoup.safety.Whitelist;

@WebServlet("/markers")
public class MarkerServlet extends HttpServlet {

  private Datastore datastore;
  private Gson gson;

  @Override
  public void init() {
    datastore = new Datastore();
    gson = new Gson();
  }

  /** Responds with a JSON array containing marker data. */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("application/json");
    List<Marker> markers = datastore.getAllMarkers();
    response.getOutputStream().println(gson.toJson(markers));
  }

  /** Accepts a POST request containing a new marker. */
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) {
    double lat = Double.parseDouble(request.getParameter("lat"));
    double lng = Double.parseDouble(request.getParameter("lng"));
    String content = Jsoup.clean(request.getParameter("content"), Whitelist.none());

    Marker marker = new Marker(lat, lng, content);
    datastore.storeMarker(marker);
  }
}