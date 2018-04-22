#! /bin/bash

concurrently \
-n p0,j0,c0,c1,j1 \
"node src/producer.js" \
"node src/producer-consumer.js a inference.new.*" \
"node src/producer-consumer.js b inference.new.* inference.good.very" \
"node src/producer-consumer.js b inference.new.* inference.good.very" \
"node src/producer-consumer.js c inference.good.very"