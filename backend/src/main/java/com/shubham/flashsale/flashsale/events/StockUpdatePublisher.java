package com.shubham.flashsale.flashsale.events;

import com.shubham.flashsale.flashsale.events.StockUpdateEvent;

public interface StockUpdatePublisher {

    void publish(StockUpdateEvent event);

}