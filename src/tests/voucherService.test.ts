import { jest } from "@jest/globals";
import voucherService from "services/voucherService";
import voucherRepository from "repositories/voucherRepository";

describe("createVoucher", () => {
  jest
    .spyOn(voucherRepository, "createVoucher")
    .mockImplementationOnce((): any => {});

  it("should generate a unique voucher", () => {
    const voucher = {
      id: 1,
      code: "code10",
      discount: 10,
      used: false,
    };

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockResolvedValueOnce(voucher);

    const promise = voucherService.createVoucher(
      voucher.code,
      voucher.discount
    );

    expect(promise).rejects.toEqual({
      type: "conflict",
      message: "Voucher already exist.",
    });
  });
});

describe("applyVoucher", () => {
  jest
    .spyOn(voucherRepository, "createVoucher")
    .mockImplementationOnce((): any => {});

  it("should only be used once per voucher code", async () => {
    const amount = 100;
    const voucher = {
      id: 1,
      code: "code10",
      discount: 10,
      used: true,
    };

    jest
      .spyOn(voucherRepository, "useVoucher")
      .mockImplementationOnce((): any => {
        voucher.used = true;
      });

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockResolvedValueOnce(voucher);

    const response = await voucherService.applyVoucher(voucher.code, amount);
      
    expect(response).toEqual({
      amount,
      discount: voucher.discount,
      finalAmount: response.finalAmount,
      applied: false,
    });
  });

  it("should have a minimun amount of 100", async () => {
    const amount = 99;
    const voucher = {
      id: 1,
      code: "code10",
      discount: 10,
      used: false,
    };

    jest
      .spyOn(voucherRepository, "useVoucher")
      .mockImplementationOnce((): any => {
        voucher.used = true;
      });

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockResolvedValueOnce(voucher);

    const response = await voucherService.applyVoucher(voucher.code, amount);

    expect(response).toEqual({
      amount,
      discount: voucher.discount,
      finalAmount: response.finalAmount,
      applied: false,
    });
  });
  
  it("should respond correctly if voucher is applied", async () => {
    const amount = 200;
    const voucher = {
      id: 1,
      code: "code30",
      discount: 30,
      used: false,
    };

    jest
      .spyOn(voucherRepository, "useVoucher")
      .mockImplementationOnce((): any => {
        voucher.used = true;
      });

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockResolvedValueOnce(voucher);

    const response = await voucherService.applyVoucher(voucher.code, amount);

    expect(response).toEqual({
      amount,
      discount: voucher.discount,
      finalAmount: response.finalAmount,
      applied: true,
    });
  });
});
