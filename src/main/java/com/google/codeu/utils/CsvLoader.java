package com.google.codeu.utils;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import java.util.Scanner;

public class CsvLoader {

  /**
   * Loads data from a csv from the given scanner and returns a json array
   */
  public static JsonArray csvToJson(Scanner scanner) throws Exception {

    JsonArray jsonArray = new JsonArray();
    String headerLine = scanner.nextLine();
    String[] headers = headerLine.split(",");
    while(scanner.hasNextLine()) {
      String line = scanner.nextLine();
      String[] cells = line.split(",");

      JsonObject obj = new JsonObject();
      if (cells.length > 0 && cells.length != headers.length)
        throw new IllegalArgumentException("Corrupted csv file!");
      for (int i = 0; i < cells.length; i++) {
        obj.addProperty(headers[i], cells[i]);
      }
      jsonArray.add(obj);
    }
    scanner.close();

    return jsonArray;
  }
}