.PHONY: locked demo-py demo-node parity selftest

# In the protected repository the app only runs under the NakodaX runtime.
# On a plaintext development checkout, override: make parity PY_RUN=python3 NODE_RUN=node
PY_RUN   ?= nkx-run
NODE_RUN ?= npx -y -p @nakodax/runtime nkx-run

# What a visitor sees before unlocking.
locked:
	-python3 python/run.py

demo-py:
	$(PY_RUN) python/run.py demo

demo-node:
	$(NODE_RUN) node/run.js demo

selftest:
	$(PY_RUN) python/run.py selftest
	$(NODE_RUN) node/run.js selftest

# Both runtimes decrypt their own copy of the app and must print the same digests.
parity:
	@d=$$(mktemp -d) && \
	  $(PY_RUN) python/run.py export --no-color > "$$d/py.txt" && \
	  $(NODE_RUN) node/run.js export --no-color > "$$d/node.txt" && \
	  diff --strip-trailing-cr "$$d/py.txt" "$$d/node.txt" && echo "parity OK: Python and Node agree" && cat "$$d/py.txt"
