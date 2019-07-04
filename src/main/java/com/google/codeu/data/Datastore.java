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

package com.google.codeu.data;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.SortDirection;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/** Provides access to the data stored in Datastore. */
public class Datastore {

  private DatastoreService datastore;

  public Datastore() {
    datastore = DatastoreServiceFactory.getDatastoreService();
  }

  /** Stores the Message in Datastore. */
  public void storeMessage(Message message) {
    Key parentKey;
    Entity messageEntity = new Entity("Message", message.getId().toString(), parentKey);
    messageEntity.setProperty("user", message.getUser());
    messageEntity.setProperty("text", message.getText());
    messageEntity.setProperty("timestamp", message.getTimestamp());
    messageEntity.setProperty("sentimentScore", message.getSentimentScore());

    datastore.put(messageEntity);
  }

  /**
   * Gets messages posted by a specific user.
   *
   * @return a list of messages posted by the user, or empty list if user has never posted a
   *     message. List is sorted by time descending.
   */
  public List<Message> getMessages(String user) {
    List<Message> messages;
    Query query =
        new Query("Message")
            .setFilter(new Query.FilterPredicate("user", FilterOperator.EQUAL, user))
            .addSort("timestamp", SortDirection.DESCENDING);
    messages = getMessagesHelperFunction(query);
    return messages;
  }

  /**
   * Gets all messages.
   *
   * @return a list of all messages posted, or empty list if no messages have
   *     been posted. List is sorted by time descending.
   */
  public List<Message> getAllMessages(){
    List<Message> messages;
    Query query =
      new Query("Message")
        .addSort("timestamp", SortDirection.DESCENDING);

    messages = getMessagesHelperFunction(query);
    return messages;
  }

  /*
   * Constructs a new message with all the message entities
   */
  private List<Message> getMessagesHelperFunction(Query query){
    List<Message> messages = new ArrayList<>();

    PreparedQuery results = datastore.prepare(query);

    for (Entity entity : results.asIterable()) {
      try {
        String idString = entity.getKey().getName();
        UUID id = UUID.fromString(idString);
        String user = (String) entity.getProperty("user");
        String text = (String) entity.getProperty("text");
        long timestamp = (long) entity.getProperty("timestamp");
        double sentimentScore = (double) entity.getProperty("sentimentScore");

        Message message = new Message(id, user, text, timestamp, sentimentScore);
        messages.add(message);
      } catch (Exception e) {
        System.err.println("Error reading message.");
        System.err.println(entity.toString());
        e.printStackTrace();
      }
    }
    return messages;
  }

  /* Returns all the message entities based on the parentKey */
  public List<Entity> getMessagesForParentKey(String key) {
    List<Entity> messages = new ArrayList<>();
    Query query = new Query("Message").setAncestor;
    PreparedQuery results = datastore.prepare(query);

    for (Entity entity : results.asIterable()) {
      String parentKey = (String) entity.getProperty("parentKey");
      if (parentKey == key) {
        messages.add(entity);
      }
    }

    return messages;
  }

  /**
   * Gets all users
   * @return a list of user strings or empty string if there is no user
   */
  public Set<String> getUsers() {
    Set<String> users = new HashSet<>();
    Query query = new Query("Message");
    PreparedQuery results = datastore.prepare(query);
    for(Entity entity : results.asIterable()) {
      users.add((String) entity.getProperty("user"));
    }
    return users;
  }

  /**
   * Gets number of total messages
   *
   * @return the total number of messages for all users.
   */
  public int getTotalMessageCount() {
    Query query = new Query("Message");
    PreparedQuery results = datastore.prepare(query);
    return results.countEntities(FetchOptions.Builder.withLimit(1000));
  }

  /**
   * Gets the longest message length
   *
   * @return the longest message length
   */
  public int getLongestMessageLength() {
    Query query = new Query("Message");
    PreparedQuery results = datastore.prepare(query);
    int maxLength = 0;
    for (Entity entity : results.asIterable()) {
      String msgText = (String) entity.getProperty("text");
      int msgLength = msgText.length();
      if (msgLength > maxLength) {
        maxLength = msgLength;
      }
    }
    return maxLength;
  }


}
