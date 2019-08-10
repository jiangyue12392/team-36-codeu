/*
 * Copyright 2019 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.google.codeu.servlets;

import com.google.codeu.data.Datastore;
import com.google.gson.Gson;
import java.io.IOException;
import java.util.HashMap;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Handles calculating an aggregate sentiment score for all messages under a
 * specific parent key.
 */
@WebServlet("/sentiment-aggregate")
public class AggregateSentimentScoreServlet extends HttpServlet {

  private Datastore datastore;
  private Gson gson;
  private HashMap <String, Double> sentimentScoresMap = new HashMap<>();

  @Override
  public void init() {
    datastore = new Datastore();
    gson = new Gson();
  }

  /**
   * Makes a request to datastore and retrieves aggregate sentiment score for all messages.
   * Calculates sentiment score for message of each type and stores in a dictionary
   */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    sentimentScoresMap = datastore.getAggregateSentiment();
    response.getOutputStream().println(gson.toJson(sentimentScoresMap));
  }
}
