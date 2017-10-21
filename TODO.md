# TODO list

* Provider - Consumer model
* Building extensions near harvesters

# Stages

1. Create harvesters for closest Source
1. Upgrade RCL -> 2
1. Build extensions
1. Create static miners (further locations first)
1. Replace existing miners with static ones
1. Create carriers
1. Build roads
1. Build containers

# Energy prioritisation system

Consumers:
* Builders
* Upgraders
* Spawner
* Extension
* Container

Providers:
* Harverster
* Spawner
* Extension
* Carrier

Delivery is done by carriers. Spawner always requests energy even if it's full
but at a lower priority. In the beginning harvesters are providers, but later
when they put energy in a container nearby, they will stop being providers.
Containers can be both providers and consumers, but they are low priority
consumers allowing buffering of resources.

Spawn requests to renew and spawn are can make requests for Spawner energy at
the same priority.

