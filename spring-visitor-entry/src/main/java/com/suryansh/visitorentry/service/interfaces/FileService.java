package com.suryansh.visitorentry.service.interfaces;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface FileService {
    String addNewImage(MultipartFile file, String imageName);

    byte[] getImage(String name) throws IOException;

    void handleUpdateImage(String name, MultipartFile file);

    boolean checkFileExist(String visitorImage);
}
