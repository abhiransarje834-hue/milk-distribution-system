package com.milkdist.service;

import com.milkdist.dto.*;
import com.milkdist.entity.*;
import com.milkdist.exception.AppException;
import com.milkdist.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final BillRepository billRepository;
    private final CustomerRepository customerRepository;
    private final DistributorRepository distributorRepository;
    private final DailyDeliveryRepository deliveryRepository;
    private final PaymentRepository paymentRepository;

    private BigDecimal calcPendingBalance(Customer customer) {
        BigDecimal totalDelivered = deliveryRepository
            .findByCustomerAndDeliveryDateBetween(customer,
                LocalDate.of(2000, 1, 1), LocalDate.now())
            .stream()
            .filter(d -> d.getDeliveryStatus() == DailyDelivery.DeliveryStatus.DELIVERED)
            .map(DailyDelivery::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalPaid = paymentRepository
            .findByCustomerOrderByPaymentDateDesc(customer)
            .stream()
            .map(Payment::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        return totalDelivered.subtract(totalPaid).max(BigDecimal.ZERO);
    }
    @Transactional
    public List<BillResponse> generateMonthlyBills(Long distributorUserId, int month, int year) {
        Distributor distributor = distributorRepository.findByUserId(distributorUserId)
            .orElseThrow(() -> AppException.notFound("Distributor not found"));

        List<Customer> customers = customerRepository.findByDistributorAndActive(distributor, true);
        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        return customers.stream().map(customer -> {
            BigDecimal currentAmount = deliveryRepository
                .findByCustomerAndDeliveryDateBetween(customer, start, end)
                .stream()
                .filter(d -> d.getDeliveryStatus() == DailyDelivery.DeliveryStatus.DELIVERED)
                .map(DailyDelivery::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            Bill bill = billRepository.findByCustomerAndBillMonthAndBillYear(customer, month, year)
                .orElse(Bill.builder()
                    .customer(customer)
                    .distributor(distributor)
                    .billMonth(month)
                    .billYear(year)
                    .previousPending(customer.getPendingBalance())
                    .paidAmount(BigDecimal.ZERO)
                    .generatedDate(LocalDate.now())
                    .build());

            bill.setCurrentMonthAmount(currentAmount);
            bill.setTotalAmount(currentAmount.add(bill.getPreviousPending()));
            bill.setRemainingAmount(bill.getTotalAmount().subtract(bill.getPaidAmount()).max(BigDecimal.ZERO));
            customer.setPendingBalance(bill.getRemainingAmount());
            customerRepository.save(customer);
            bill.setStatus(bill.getRemainingAmount().compareTo(BigDecimal.ZERO) <= 0
                ? Bill.BillStatus.PAID : bill.getPaidAmount().compareTo(BigDecimal.ZERO) > 0
                ? Bill.BillStatus.PARTIAL : Bill.BillStatus.GENERATED);

            return toBillResponse(billRepository.save(bill));
        }).toList();
    }

    @Transactional
    public BillResponse recordPayment(Long distributorUserId, PaymentRequest req) {
        Distributor distributor = distributorRepository.findByUserId(distributorUserId)
            .orElseThrow(() -> AppException.notFound("Distributor not found"));
        Customer customer = customerRepository.findById(req.getCustomerId())
            .orElseThrow(() -> AppException.notFound("Customer not found"));

        Payment payment = Payment.builder()
            .customer(customer)
            .distributor(distributor)
            .amount(req.getAmount())
            .paymentDate(req.getPaymentDate())
            .paymentMode(Payment.PaymentMode.valueOf(req.getPaymentMode()))
            .notes(req.getNotes())
            .build();

        if (req.getBillId() != null) {
            Bill bill = billRepository.findById(req.getBillId())
                .orElseThrow(() -> AppException.notFound("Bill not found"));
            payment.setBill(bill);
            bill.setPaidAmount(bill.getPaidAmount().add(req.getAmount()));
            bill.setRemainingAmount(bill.getTotalAmount().subtract(bill.getPaidAmount()));
            bill.setStatus(bill.getRemainingAmount().compareTo(BigDecimal.ZERO) <= 0
                ? Bill.BillStatus.PAID : Bill.BillStatus.PARTIAL);
            billRepository.save(bill);
        }

        customer.setPendingBalance(customer.getPendingBalance().subtract(req.getAmount()).max(BigDecimal.ZERO));
        customerRepository.save(customer);
        paymentRepository.save(payment);

        return billRepository.findById(req.getBillId() != null ? req.getBillId() : -1L)
            .map(this::toBillResponse).orElse(null);
    }

    public List<BillResponse> getBillsByMonth(Long distributorUserId, int month, int year) {
        Distributor distributor = distributorRepository.findByUserId(distributorUserId)
            .orElseThrow(() -> AppException.notFound("Distributor not found"));
        return billRepository.findByDistributorAndBillMonthAndBillYear(distributor, month, year)
            .stream().map(this::toBillResponse).toList();
    }

    public BillResponse toBillResponse(Bill b) {
        String whatsappMsg = buildWhatsAppMessage(b);
        return BillResponse.builder()
            .id(b.getId())
            .customerId(b.getCustomer().getId())
            .customerName(b.getCustomer().getName())
            .customerMobile(b.getCustomer().getMobile())
            .deliveryBoyName(b.getCustomer().getDeliveryBoy() != null
                ? b.getCustomer().getDeliveryBoy().getName() : "N/A")
            .distributorName(b.getDistributor().getName())
            .billMonth(b.getBillMonth())
            .billYear(b.getBillYear())
            .currentMonthAmount(b.getCurrentMonthAmount())
            .previousPending(b.getPreviousPending())
            .paidAmount(b.getPaidAmount())
            .totalAmount(b.getTotalAmount())
            .remainingAmount(b.getRemainingAmount())
            .status(b.getStatus())
            .generatedDate(b.getGeneratedDate())
            .whatsappMessage(whatsappMsg)
            .build();
    }

    private String buildWhatsAppMessage(Bill b) {
        String[] monthNames = {"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"};
        String monthName = monthNames[b.getBillMonth() - 1];
        String deliveryBoyName = b.getCustomer().getDeliveryBoy() != null
            ? b.getCustomer().getDeliveryBoy().getName() : "N/A";
        return String.format(
            "🥛 *Milk Bill - %s %s*%n%n" +
            "👤 Customer: *%s*%n" +
            "🚴 Delivery Boy: %s%n%n" +
            "📋 *Bill Summary*%n" +
            "Monthly Charges : ₹%.2f%n" +
            "Previous Balance : ₹%.2f%n" +
            "─────────────────%n" +
            "Total Bill       : ₹%.2f%n" +
            "Amount Paid      : ₹%.2f%n" +
            "Balance Due      : ₹%.2f%n%n" +
            "%s%n%n" +
            "Thank you! 🙏",
            monthName, b.getBillYear(),
            b.getCustomer().getName(),
            deliveryBoyName,
            b.getCurrentMonthAmount(),
            b.getPreviousPending(),
            b.getTotalAmount(),
            b.getPaidAmount(),
            b.getRemainingAmount(),
            b.getRemainingAmount().compareTo(BigDecimal.ZERO) <= 0
                ? "✅ Payment Complete" : "⚠️ Please pay the balance at earliest."
        );
    }
}
