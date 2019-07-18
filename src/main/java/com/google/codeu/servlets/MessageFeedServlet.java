package com.google.codeu.servlets;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.codeu.data.Datastore;
import com.google.codeu.data.Message;
import com.google.codeu.utils.Translator;
import com.google.gson.Gson;

/**
 * Handles fetching all messages for the public feed.
 */
@WebServlet("/feed")
public class MessageFeedServlet extends HttpServlet{

  private Datastore datastore;
  private Gson gson;

  @Override
  public void init() {
    datastore = new Datastore();
    gson = new Gson();
  }

  /**
   * Responds with a JSON representation of Message data for all users.
   */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    // get parameters
    String language = request.getParameter("language");
    String cinemaKey = request.getParameter("cinemaKey");

    // get messages from datastore
    List<Message> messages;
    if (cinemaKey == null || cinemaKey.equals("all")) {
      messages = datastore.getAllMessages();
    } else {
      messages = datastore.getMessagesForParentKey(cinemaKey);
    }

    // translate messages if needed
    List<Message> translatedMessage = new ArrayList<Message>();
    if (language == null || language.equals("original")) {
      translatedMessage = messages;
    } else {
      try {
        for (Message msg : messages) {
          translatedMessage.add(new Message(msg.getId(), msg.getUser(),
                                Translator.translate(msg.getText(), language), msg.getTimestamp(), msg.getSentimentScore()));
        }
      } catch (Exception e) {
        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Translation Failure.");
      }
    }

    String json = gson.toJson(translatedMessage);
    response.setContentType("application/json; charset=UTF-8");
    response.setCharacterEncoding("UTF-8");
    response.getWriter().println(json);
  }
}
