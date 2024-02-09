const salesModel = require('../../models/employeeModels/employeeSalesSchema');
const employeeSchema = require('../../models/employeeModels/employeeSchema');

exports.employeeRecord = async (req, res) => {
    try {
        const overAllRecord = await salesModel.find({ employeeInfo: req.user.id });

        let totalSaleAmount = 0;

        if (overAllRecord) {
            overAllRecord.forEach((elem) => {
                totalSaleAmount += Number(elem.grand_total);
            })
        }

        const pendingSales = await salesModel.find({ checkStatus: 'Pending', employeeInfo: req.user.id });

        let pendingSalesAmount = 0;
        if (pendingSales) {
            pendingSales.forEach((elem) => {
                pendingSalesAmount += Number(elem.grand_total);
            })
        }

        const approvedSales = await salesModel.find({ checkStatus: 'Approved', employeeInfo: req.user.id });

        let approvedSalesAmount = 0;

        if (approvedSales) {
            approvedSales.forEach((elem) => {
                approvedSalesAmount += Number(elem.grand_total)
            })
        }

        const pendingSalesCount = await salesModel.countDocuments({ checkStatus: 'Pending', employeeInfo: req.user.id });
        const approvedSalesCount = await salesModel.countDocuments({ checkStatus: 'Approved', employeeInfo: req.user.id });
        const overallSalesCount = await salesModel.countDocuments({ employeeInfo: req.user.id });

        return res.status(200).json({ overAllSales: totalSaleAmount, pendingSales: pendingSalesAmount, approvedSales: approvedSalesAmount, pendingSalesCount, approvedSalesCount, overallSalesCount });
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

exports.empSalesProdWise = async (req, res) => {
    try {
        const totalEmpSaleProdWise = await salesModel.find({ employeeInfo: req.user.id });

        let catering = 0;
        let retail = 0;
        let registration = 0;
        let state = 0;

        if (totalEmpSaleProdWise) {
            totalEmpSaleProdWise.forEach((elem) => {
                if (elem.product_name.includes("Fostac")) {
                    if (elem.fostacInfo.fostac_service_name === 'Catering') {
                        catering += 1;
                    } else if (elem.fostacInfo.fostac_service_name === 'Retail') {
                        retail += 1;
                    }
                }
                if (elem.product_name.includes("Foscos")) {
                    if (elem.foscosInfo.foscos_service_name === 'Registration') {
                        registration += 1;
                    } else if (elem.foscosInfo.foscos_service_name === 'State') {
                        state += 1;
                    }
                }
            })
        }

        return res.status(200).json({ catering, retail, registration, state });
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

exports.employeeSalesData = async (req, res) => {
    try {
        let salesInfo;
        console.log(req.user.designation)
        if(req.user.designation==='Director'){
            salesInfo = await salesModel.find({}).populate('fboInfo').select('-employeeInfo');
        } else{
            salesInfo = await salesModel.find({ employeeInfo: req.user.id }).populate('fboInfo').select('-employeeInfo');
        }
        return res.status(200).json({ salesInfo });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.employeeDepartmentCount = async (req, res) => {

    try {

        let success = false;

        const employeeGroupCount = await employeeSchema.aggregate([
            {
                $group: {
                    _id: { department: '$department' },
                    count: { $sum: 1 }
                }
            }
        ])

        if (!employeeGroupCount) {
            success = false;
            return res.status(404).json({ success, randomErr: true });
        }

        success = true;

        return res.status(200).json({ success, employeeGroupCount })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }

}