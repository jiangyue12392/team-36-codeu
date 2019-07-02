package com.google.codeu.servlets;

import com.google.gson.Gson;
import java.util.List;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

import com.google.codeu.data.Datastore;
import com.google.codeu.data.Marker;

/**
 * Returns cinema location data as a JSON array, e.g. [{"lat": 38.4404675, "lng": -122.7144313}]
 */
@WebServlet("/cinema-data")
public class CinemaLocationServlet extends HttpServlet {
  private List<Marker> cinemaInfos;
  private Datastore datastore;
  private Gson gson;

  @Override
  public void init() {
    datastore = new Datastore();
    gson = new Gson();
    cinemaInfos = datastore.getAllMarkers();
  }

  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("application/json");
    response.getOutputStream().println(gson.toJson(cinemaInfos));
  }
}