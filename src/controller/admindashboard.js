const productModel = require('../../Models/productdetails');
const orderModel = require('../../Models/order');
const signupModel = require('../../Models/signupmodel');


exports.dashboardStock = async (req, res) => {
    try {
        
        
        const result = await productModel.aggregate([
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$quantity' }
                }
            }
        ]).exec(); // Use exec() instead of toArray()

        const _idArray = result.map(item => item._id);
        const totalArray = result.map(item => item.total);

        res.status(200).json({ category:_idArray,total:totalArray });
    } catch (error) {
        console.error('Error in dashboardStock:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}



exports.dailySales = async (req, res) => {
    try {
        const result = await orderModel.aggregate([
            {
                $match: { status: 'Delivered' } // Filter by status
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$orderdate' },
                        month: { $month: '$orderdate' },
                        day: { $dayOfMonth: '$orderdate' }
                    },
                    totalSales: { $sum: { $toDouble: '$total' } }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: {
                        $dateFromParts: {
                            year: '$_id.year',
                            month: '$_id.month',
                            day: '$_id.day'
                        }
                    },
                    totalSales: 1
                }
            }
        ]).exec();
        res.status(200).json(result);
    } catch (error) {
        console.error('Error calculating daily sales:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.totalusers = async (req, res) => {
    try {
        const result = await signupModel.aggregate([
            {
                $match: {
                    role: 'user',
                    verified: true,
                    blocked: false
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: {
                        $dateFromParts: {
                            year: '$_id.year',
                            month: '$_id.month',
                            day: '$_id.day'
                        }
                    },
                    count: 1
                }
            }
        ]).exec();
        res.status(200).json(result);
    } catch (error) {
        console.error('Error calculating total users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

