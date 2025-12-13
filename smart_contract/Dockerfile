# docker image
FROM mysten/sui-tools:testnet

# set working directory
WORKDIR /workspace

# copy files
COPY Move.toml .
COPY sources ./sources

# create move packet
RUN sui move build

CMD ["bash"]