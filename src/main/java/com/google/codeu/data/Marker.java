package com.google.codeu.data;

/** A single marker produced by a user. */
public class Marker {

  private double lat;
  private double lng;
  private String content;
  private String key;

  /**
   * Constructs a new {@link Marker} posted by {@code user} with {@code text} content. Generates a
   * {@code lat} and a {@code lng} based on the latitude and longitude on the map where the marker
   * is placed.
   */
  public Marker(double lat, double lng, String content) {
    this(lat, lng, content, Double.toString(lat) + '-' + Double.toString(lng));
  }

  public Marker(double lat, double lng, String content, String key) {
    this.lat = lat;
    this.lng = lng;
    this.content = content;
    this.key = key;
  }

  public String getKey() {
    return key;
  }

  public double getLat() {
    return lat;
  }

  public double getLng() {
    return lng;
  }

  public String getContent() {
    return content;
  }
}