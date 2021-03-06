const debug = require(`debug`)(`request-handler:network-count`);
const db = require(`../../../db/index`);
const Response = require(`../../../shim/Response`);
const CountNetworkRequestBody = require(`../../../common/model/rpc/CountNetworkRequestBody`);
const CountResponseBody = require(`../../../common/model/rpc/CountResponseBody`);


/**
 * Network count request handler
 * @param request
 * @returns {Promise<void>}
 */
module.exports = async (request) => {
    const countNetworkRequestBody = new CountNetworkRequestBody(request.body);
    const response = new Response();

    debug(`Request (correlation id: ${request.correlationId}): ${countNetworkRequestBody}`);

    const count = await countNetworks(countNetworkRequestBody);

    response.errorCode = 0;
    response.failed = false;
    response.withBody(new CountResponseBody({ count: count }));

    debug(`Response (correlation id: ${request.correlationId}): ${response.body}`);

    return response;
};

/**
 * Fetch Networks amount from db by predicates
 * @param countNetworkRequestBody
 * @returns {Promise<*>}
 */
async function countNetworks (countNetworkRequestBody) {
    const models = await db.getModels();
    const networkDAO = models[`Network`];
    const userNetworkDAO = models[`UserNetwork`];
    const principal = countNetworkRequestBody.principal;
    const networkFilterObject = {};


    if (countNetworkRequestBody.namePattern) {
        networkFilterObject.name = { like: countNetworkRequestBody.namePattern };
    }

    if (countNetworkRequestBody.name) {
        networkFilterObject.name = countNetworkRequestBody.name;
    }

    if (principal) {
        const user = principal.getUser();

        if (user && !user.isAdmin()) {
            const userNetworks = await userNetworkDAO.find({where: {userId: user.id}});
            const userNetworkIds = userNetworks.map(userNetwork => parseInt(userNetwork.networkId));

            networkFilterObject.id = { inq: userNetworkIds };
        }

        if (principal.networkIds) {
            let networkIds;

            if (networkFilterObject.id) {
                networkIds = networkFilterObject.id.inq.filter(networkId => {
                    return principal.networkIds.includes(networkId);
                });
            } else {
                networkIds = principal.networkIds;
            }

            networkFilterObject.id = { inq: networkIds };
        }
    }

    return await networkDAO.count(networkFilterObject);
}
