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

  @Override
  public void init() {
    datastore = new Datastore();
  }

  /**
   * Responds with a JSON representation of Message data for all users.
   */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

    response.setContentType("application/json");

    List<Message> messages = datastore.getAllMessages();
    Gson gson = new Gson();
    String json = gson.toJson(messages);

    response.getOutputStream().println(json);
  }

  /**
   * Process translation request and response with a JSON representation of translated Messages
   */
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String language = request.getParameter("language");

    List<Message> messages = datastore.getAllMessages();
    List<Message> translatedMessage = new ArrayList<Message>();

    if (language.equals("original")) {
      translatedMessage = messages;
    } else {
      try {
        for (Message msg : messages) {
          translatedMessage.add(new Message(msg.getId(), msg.getUser(),
                                Translator.translate(msg.getText(), language), msg.getTimestamp()));
        }
      } catch (Exception e) {
        response.getOutputStream().println(e.toString());
      }
    }

    Gson gson = new Gson();
    String json = gson.toJson(translatedMessage);
    response.setContentType("application/json; charset=UTF-8");
    response.setCharacterEncoding("UTF-8");
    response.getWriter().println(json);
  }
}