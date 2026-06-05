package com.milkdist.service;

import com.milkdist.dto.DashboardStats;
import com.milkdist.entity.Distributor;
import com.milkdist.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final DistributorRepository distributorRepository;
    private final CustomerRepository customerRepository;
    private final DeliveryBoyRepository deliveryBoyRepository;
    private final DailyDeliveryRepository deliveryRepository;
    private final BillRepository billRepository;

    public DashboardStats getDashboardStats(Long distributorUserId) {
        Distributor distributor = distributorRepository.findByUserId(distributorUserId)
            .orElseThrow();

        LocalDate today = LocalDate.now();
        YearMonth currentMonth = YearMonth.now();
        LocalDate monthStart = currentMonth.atDay(1);
        LocalDate monthEnd = currentMonth.atEndOfMonth();

        return DashboardStats.builder()
            .totalCustomers(customerRepository.countByDistributorAndActive(distributor, true))
            .totalDeliveryBoys(deliveryBoyRepository.countByDistributorAndActive(distributor, true))
            .todaySale(deliveryRepository.sumTotalAmountByDistributorAndDate(distributor, today))
            .monthlySale(deliveryRepository.sumTotalAmountByDistributorAndDateRange(distributor, monthStart, monthEnd))
            .monthlyRevenue(deliveryRepository.sumTotalAmountByDistributorAndDateRange(distributor, monthStart, monthEnd))
            .pendingPayments(customerRepository.sumPendingBalanceByDistributor(distributor))
            .todayQuantity(deliveryRepository.sumQuantityByDistributorAndDateRange(distributor, today, today))
            .monthlyQuantity(deliveryRepository.sumQuantityByDistributorAndDateRange(distributor, monthStart, monthEnd))
            .build();
    }

    public List<Map<String, Object>> getDailySalesChart(Long distributorUserId, int month, int year) {
        Distributor distributor = distributorRepository.findByUserId(distributorUserId).orElseThrow();
        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<Map<String, Object>> result = new ArrayList<>();
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            BigDecimal amount = deliveryRepository.sumTotalAmountByDistributorAndDate(distributor, date);
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("date", date.toString());
            entry.put("amount", amount);
            result.add(entry);
        }
        return result;
    }

    public List<Map<String, Object>> getDeliveryBoyPerformance(Long distributorUserId, int month, int year) {
        Distributor distributor = distributorRepository.findByUserId(distributorUserId).orElseThrow();
        YearMonth ym = YearMonth.of(year, month);
        List<Object[]> rows = deliveryRepository.getDeliveryBoyPerformance(
            distributor, ym.atDay(1), ym.atEndOfMonth());

        return rows.stream().map(row -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("deliveryBoyId", row[0]);
            m.put("name", row[1]);
            m.put("deliveries", row[2]);
            m.put("totalQuantity", row[3]);
            return m;
        }).toList();
    }

    public List<Map<String, Object>> getMonthlyTrend(Long distributorUserId, int year) {
        Distributor distributor = distributorRepository.findByUserId(distributorUserId).orElseThrow();
        List<Map<String, Object>> result = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            YearMonth ym = YearMonth.of(year, m);
            BigDecimal amount = deliveryRepository.sumTotalAmountByDistributorAndDateRange(
                distributor, ym.atDay(1), ym.atEndOfMonth());
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("month", ym.getMonth().name());
            entry.put("amount", amount);
            result.add(entry);
        }
        return result;
    }
}
