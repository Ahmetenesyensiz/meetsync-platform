package com.meetsync.roomservice.dto;

import lombok.Data;

@Data
public class AddMemberRequest {
    private String userEmail;
    private String userName;
    private String memberRole;
}
