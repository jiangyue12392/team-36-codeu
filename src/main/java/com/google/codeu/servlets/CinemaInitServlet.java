package com.google.codeu.servlets;

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.codeu.data.Datastore;
import com.google.codeu.data.Marker;
import java.io.IOException;
import java.util.Scanner;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonElement;
import com.google.codeu.utils.CsvLoader;

/** Handles initialization of {@link Marker} instances for each cinema. */
@WebServlet("/cinema-init")
public class CinemaInitServlet extends HttpServlet {

  private static String cinemaLocationFilePath = "/WEB-INF/cinemaLocations.csv";
  private Datastore datastore;
  private JsonArray cinemaInfos;

  @Override
  public void init() {
    datastore = new Datastore();
  }

  /**
   * Checks user login credentials. If user is admin, loads cinema location and description from
   * csv file to datastore. If not, redirect the user to home page.
   */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    UserService userService = UserServiceFactory.getUserService();
    // Redirects user to login page if not logged in
    if (!userService.isUserLoggedIn()) {
      response.sendRedirect("/login");
      return;
    }
    // Redirects user if not admin
    if (!userService.isUserAdmin()) {
      response.sendRedirect("/index.html");
      return;
    }
    // Loads cinema infos from file
    Scanner scanner = new Scanner(getServletContext().getResourceAsStream(cinemaLocationFilePath));
    try {
      cinemaInfos = CsvLoader.csvToJson(scanner);
    } catch (Exception e) {
      System.out.println(e.toString());
    }
    // Addes each cinema as marker to datastore
    for (JsonElement cinemaElement : cinemaInfos) {
      JsonObject cinema = cinemaElement.getAsJsonObject();
      double lat = cinema.get("Latitude").getAsDouble();
      double lng = cinema.get("Longitude").getAsDouble();
      String content = cinema.get("CinemaName").getAsString();
      Marker marker = new Marker(lat, lng, content);
      datastore.storeMarker(marker);
    }

    response.sendRedirect("/index.html");
  }
}