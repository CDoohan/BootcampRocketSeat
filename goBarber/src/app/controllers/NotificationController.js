

import Notification from '../schemas/notification';
import User from '../models/User';

class NotificationController {
  /* Controller Methods (add, edit, list, etc) */

  async index(req, res){

    /* Check if provider_id is a provider */
    const isProvider = await User.findOne({ where: { id: req.userId, provider: true } });

    if( !isProvider ){
      return res.status(401).json({ error : 'You can only see notifications if u are provider!'});
    }

    const notifications = await Notification.find({
      user: req.userId
    }).sort({ createdAt: 'desc' }).limit(20);

    return res.json(notifications);
  }

  async update(req, res){

    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read : true },
      { new : true }
    )

    return res.json(notification);
  }


}

/* by default all controllers exports a new instance of them */
export default new NotificationController();
