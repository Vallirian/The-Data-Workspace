package com.arc.api.workbook;

import com.arc.api.account.User;
import com.arc.api.dataTable.DataTable;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Workbook {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36)
    private String id;

    @ManyToOne
    @JoinColumn(name = "userId", referencedColumnName = "id", nullable = false)
    private User user;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /*
        a parent workbook can have only one child workbook
        changes to the parent workbook should be cascaded to the child workbook
     */
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "dataTable", referencedColumnName = "id")
    private DataTable dataTable;

    public Workbook() {
        this.createdAt = LocalDateTime.now();
    }
}
