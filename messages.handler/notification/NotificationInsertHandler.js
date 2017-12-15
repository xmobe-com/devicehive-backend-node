const hazelcastService = require(`../../service/hazelcast/HazelcastService.js`);
const eventBus = require(`../../eventbus/EventBus`);
const NotificationInsertRequestBody = require(`../../common/model/rpc/NotificationInsertRequestBody.js`);
const NotificationInsertResponseBody = require(`../../common/model/rpc/NotificationInsertResponseBody.js`);
const DeviceNotification = require(`../../common/model/DeviceNotification.js`);
const Response = require(`../../shim/Response.js`);
const NotificationEvent = require(`../../common/model/eventbus/events/NotificationEvent`);


module.exports = async (request) => {
    const deviceNotification = new NotificationInsertRequestBody(request.body).deviceNotification;
    const notificationEvent = new NotificationEvent(request.body);
    const response = new Response({ last: false });

    eventBus.publish(notificationEvent);
    await hazelcastService.store(DeviceNotification.getClassName(), deviceNotification);

    response.errorCode = 0;
    response.failed = false;
    response.withBody(new NotificationInsertResponseBody({ deviceNotification: deviceNotification.toObject() }));

    return response;
};